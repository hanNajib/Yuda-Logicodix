<?php

namespace App\Services;

use App\Ai\Agents\FastGeminiAssistant;
use App\Ai\Prompts\QuestionnairePrompt;
use App\Ai\QuestionnaireFallbackGenerator;
use App\Ai\QuestionnairePatternHasher;
use App\Models\QuestionnaireAnalysis;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Contracts\ConversationStore;
use Laravel\Ai\Contracts\VerifiesConversationOwnership;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Models\Conversation;
use Laravel\Ai\Responses\StructuredAgentResponse;
use LogicException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class YudaAiService
{
    private const OVERLOAD_FAILURE_THRESHOLD = 2;

    private const OVERLOAD_FAILURE_TTL_SECONDS = 120;

    public function __construct(private ConversationStore $conversations) {}

    /**
     * Analisis kuesioner onboarding dengan arsitektur hybrid:
     * 1. Cek cache pola di DB (instant response jika ada).
     * 2. Panggil Gemini AI dengan timeout terkendali.
     * 3. Fallback cerdas sesuai data kuis jika AI overload/rate-limited/timeout (zero error).
     *
     * @param  array{
     *     q1: string,
     *     q2?: array<int, string>|null,
     *     q3: array<int, string>,
     *     q4: string,
     *     q5: string,
     *     q6: array<int, string>,
     *     q7: array<int, string>,
     *     q8: array<int, string>,
     *     q9: string,
     *     q10: array<int, string>,
     *     conversation_id?: string|null
     * }|array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    public function analyzeQuestionnaire(User $user, array $answers): array
    {
        $patternHash = QuestionnairePatternHasher::hash($answers);

        $cachedRecord = QuestionnaireAnalysis::query()->where('pattern_hash', $patternHash)->first();
        if ($cachedRecord instanceof QuestionnaireAnalysis) {
            $cachedRecord->increment('hit_count');
            Log::info('ai.questionnaire.cache_hit', [
                'pattern_hash' => $patternHash,
                'source' => $cachedRecord->source,
            ]);

            $conversationId = $this->resolveConversationId($user, $answers['conversation_id'] ?? null);

            return [
                ...$cachedRecord->analysis,
                'conversation_id' => $conversationId,
            ];
        }

        $prompt = QuestionnairePrompt::build($answers);

        try {
            $response = $this->generate($user, $prompt, $answers['conversation_id'] ?? null);
            $analysisData = $response->toArray();

            QuestionnaireAnalysis::query()->create([
                'pattern_hash' => $patternHash,
                'answers' => QuestionnairePatternHasher::normalize($answers),
                'analysis' => $analysisData,
                'source' => 'gemini',
                'hit_count' => 1,
            ]);

            return [
                ...$analysisData,
                'conversation_id' => $response->conversationId,
            ];
        } catch (Throwable $exception) {
            // 3. Fallback deterministik sesuai data kuis jika AI gagal/timeout/rate limited
            Log::warning('ai.questionnaire.fallback_triggered', [
                'pattern_hash' => $patternHash,
                'error' => $exception->getMessage(),
                'exception_class' => $exception::class,
            ]);

            $fallbackData = QuestionnaireFallbackGenerator::generate($answers);

            QuestionnaireAnalysis::query()->create([
                'pattern_hash' => $patternHash,
                'answers' => QuestionnairePatternHasher::normalize($answers),
                'analysis' => $fallbackData,
                'source' => 'fallback',
                'hit_count' => 1,
            ]);

            $conversationId = $this->resolveConversationId($user, $answers['conversation_id'] ?? null);

            return [
                ...$fallbackData,
                'conversation_id' => $conversationId,
            ];
        }
    }

    /**
     * @return array{jawaban: string, conversation_id: string}
     */
    /**
     * Analisis kuesioner untuk pengguna guest (tanpa akun).
     * Alur sama dengan analyzeQuestionnaire, namun:
     * - Tidak menyimpan hasil ke DB
     * - Tidak membutuhkan User — AI dipanggil tanpa conversation
     *
     * @param  array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    public function analyzeQuestionnaireGuest(array $answers): array
    {
        $patternHash = QuestionnairePatternHasher::hash($answers);

        // Cek cache pola di DB — boleh pakai hasil yang sudah ada meski milik user lain
        // karena pola jawaban yang sama menghasilkan analisis yang sama
        $cachedRecord = QuestionnaireAnalysis::query()->where('pattern_hash', $patternHash)->first();
        if ($cachedRecord instanceof QuestionnaireAnalysis) {
            $cachedRecord->increment('hit_count');
            Log::info('ai.questionnaire.guest.cache_hit', [
                'pattern_hash' => $patternHash,
                'source' => $cachedRecord->source,
            ]);

            return $cachedRecord->analysis;
        }

        $prompt = QuestionnairePrompt::build($answers);

        try {
            $response = $this->generateGuest($prompt);
            $analysisData = $response->toArray();

            // Simpan ke cache pola supaya request berikutnya dengan jawaban sama bisa reuse
            QuestionnaireAnalysis::query()->create([
                'pattern_hash' => $patternHash,
                'answers' => QuestionnairePatternHasher::normalize($answers),
                'analysis' => $analysisData,
                'source' => 'gemini',
                'hit_count' => 1,
            ]);

            return $analysisData;
        } catch (Throwable $exception) {
            Log::warning('ai.questionnaire.guest.fallback_triggered', [
                'pattern_hash' => $patternHash,
                'error' => $exception->getMessage(),
                'exception_class' => $exception::class,
            ]);

            $fallbackData = QuestionnaireFallbackGenerator::generate($answers);

            QuestionnaireAnalysis::query()->create([
                'pattern_hash' => $patternHash,
                'answers' => QuestionnairePatternHasher::normalize($answers),
                'analysis' => $fallbackData,
                'source' => 'fallback',
                'hit_count' => 1,
            ]);

            return $fallbackData;
        }
    }

    /**
     * @return array{jawaban: string, conversation_id: string}
     */
    public function sendMessage(User $user, string $message, ?string $conversationId): array
    {
        $response = $this->generate($user, $message, $conversationId);
        $data = $response->toArray();
        $answer = $data['jawaban'] ?? null;

        if (! is_string($answer)) {
            throw new LogicException('The AI response did not contain a valid answer.');
        }

        return [
            'jawaban' => $answer,
            'conversation_id' => $response->conversationId,
        ];
    }

    /**
     * Panggil AI tanpa User dan conversation — khusus untuk guest.
     * Selalu mulai sesi baru, tidak ada conversation yang disimpan.
     */
    private function generateGuest(string $prompt): StructuredAgentResponse
    {
        $primaryModel = (string) config('ai.providers.gemini-compatible.models.text.default');
        $fallbackModel = config('ai.providers.gemini-compatible.models.text.fallback');

        if ($primaryModel === '') {
            throw new LogicException('The primary Gemini-compatible text model is not configured.');
        }

        $overloadCache = Cache::store('file');
        $overloadCacheKey = "ai:provider-overload-count:{$primaryModel}";
        $primaryOverloadCount = (int) $overloadCache->get($overloadCacheKey, 0);
        $fallbackModel = is_string($fallbackModel) && trim($fallbackModel) !== ''
            ? trim($fallbackModel)
            : null;

        if ($fallbackModel === null || $fallbackModel === $primaryModel) {
            $models = [$primaryModel];
        } elseif ($primaryOverloadCount >= self::OVERLOAD_FAILURE_THRESHOLD) {
            $models = [$fallbackModel];
        } else {
            $models = [$primaryModel, $fallbackModel];
        }

        foreach ($models as $index => $model) {
            $attempt = $index + 1;
            $isLastAttempt = $attempt === count($models);
            $startedAt = microtime(true);
            $outcome = 'failed';

            try {
                $agent = FastGeminiAssistant::make()->start();
                $response = $agent->prompt(
                    $prompt,
                    provider: 'gemini-compatible',
                    model: $model,
                    timeout: (int) config('ai.timeout', 20),
                );

                $outcome = 'succeeded';

                if (! $response instanceof StructuredAgentResponse) {
                    throw new LogicException('The YUDA agent did not return structured output.');
                }

                return $response;
            } catch (ProviderOverloadedException $exception) {
                $outcome = 'overloaded';
                $modelOverloadCacheKey = "ai:provider-overload-count:{$model}";
                $overloadCache->add($modelOverloadCacheKey, 0, self::OVERLOAD_FAILURE_TTL_SECONDS);
                $overloadCache->increment($modelOverloadCacheKey);

                if ($isLastAttempt) {
                    throw $exception;
                }
            } finally {
                $context = [
                    'attempt' => $attempt,
                    'model' => $model,
                    'provider' => 'gemini-compatible',
                    'duration_ms' => round((microtime(true) - $startedAt) * 1000),
                    'guest' => true,
                ];

                match ($outcome) {
                    'succeeded' => Log::info('ai.prompt.succeeded', $context),
                    'overloaded' => Log::warning('ai.prompt.overloaded', $context),
                    default => Log::error('ai.prompt.failed', $context),
                };
            }
        }

        throw new LogicException('No Gemini model was available for this prompt.');
    }

    private function generate(User $user, string $prompt, ?string $conversationId): StructuredAgentResponse
    {
        $this->authorizeConversation($conversationId, $user);

        $primaryModel = (string) config('ai.providers.gemini-compatible.models.text.default');
        $fallbackModel = config('ai.providers.gemini-compatible.models.text.fallback');

        if ($primaryModel === '') {
            throw new LogicException('The primary Gemini-compatible text model is not configured.');
        }

        $overloadCache = Cache::store('file');
        $overloadCacheKey = "ai:provider-overload-count:{$primaryModel}";
        $primaryOverloadCount = (int) $overloadCache->get($overloadCacheKey, 0);
        $fallbackModel = is_string($fallbackModel) && trim($fallbackModel) !== ''
            ? trim($fallbackModel)
            : null;

        if ($fallbackModel === null || $fallbackModel === $primaryModel) {
            $models = [$primaryModel];
        } elseif ($primaryOverloadCount >= self::OVERLOAD_FAILURE_THRESHOLD) {
            $models = [$fallbackModel];
        } else {
            $models = [$primaryModel, $fallbackModel];
        }

        foreach ($models as $index => $model) {
            $attempt = $index + 1;
            $isLastAttempt = $attempt === count($models);
            $startedAt = microtime(true);
            $outcome = 'failed';

            try {
                $agent = FastGeminiAssistant::make()->continueOrStart($conversationId, $user);
                $response = $agent->prompt(
                    $prompt,
                    provider: 'gemini-compatible',
                    model: $model,
                    timeout: (int) config('ai.timeout', 20),
                );

                $outcome = 'succeeded';

                if (! $response instanceof StructuredAgentResponse) {
                    throw new LogicException('The YUDA agent did not return structured output.');
                }

                if (! is_string($response->conversationId) || $response->conversationId === '') {
                    throw new LogicException('The AI SDK did not persist the user conversation.');
                }

                return $response;
            } catch (ProviderOverloadedException $exception) {
                $outcome = 'overloaded';
                $modelOverloadCacheKey = "ai:provider-overload-count:{$model}";
                $overloadCache->add($modelOverloadCacheKey, 0, self::OVERLOAD_FAILURE_TTL_SECONDS);
                $overloadCache->increment($modelOverloadCacheKey);

                if ($isLastAttempt) {
                    throw $exception;
                }
            } finally {
                $context = [
                    'attempt' => $attempt,
                    'model' => $model,
                    'provider' => 'gemini-compatible',
                    'duration_ms' => round((microtime(true) - $startedAt) * 1000),
                    'conversation_id' => $conversationId,
                ];

                match ($outcome) {
                    'succeeded' => Log::info('ai.prompt.succeeded', $context),
                    'overloaded' => Log::warning('ai.prompt.overloaded', $context),
                    default => Log::error('ai.prompt.failed', $context),
                };
            }
        }

        throw new LogicException('No Gemini model was available for this prompt.');
    }

    private function resolveConversationId(User $user, ?string $conversationId): string
    {
        if ($conversationId !== null) {
            $this->authorizeConversation($conversationId, $user);

            return $conversationId;
        }

        return $this->conversations->storeConversation(
            Conversation::participantType($user),
            Conversation::participantKey($user),
            'Onboarding Analysis',
        );
    }

    private function authorizeConversation(?string $conversationId, User $user): void
    {
        if ($conversationId === null) {
            return;
        }

        if (! $this->conversations instanceof VerifiesConversationOwnership) {
            throw new LogicException('The configured conversation store cannot verify conversation ownership.');
        }

        $belongsToUser = $this->conversations->conversationBelongsTo(
            $conversationId,
            Conversation::participantType($user),
            Conversation::participantKey($user),
        );

        if (! $belongsToUser) {
            throw new NotFoundHttpException;
        }
    }
}
