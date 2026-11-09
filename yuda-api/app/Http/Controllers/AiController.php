<?php

namespace App\Http\Controllers;

use App\Http\Requests\Ai\AnalyzeQuestionnaireRequest;
use App\Http\Requests\Ai\SendAiMessageRequest;
use App\Models\User;
use App\Services\YudaAiService;
use Closure;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Ai\Exceptions\AiException;
use Laravel\Ai\Exceptions\ProviderConnectionException;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Throwable;

class AiController extends Controller
{
    public function __construct(private YudaAiService $yudaAi) {}

    public function __invoke(SendAiMessageRequest $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        /** @var array{pesan: string, conversation_id?: string|null} $data */
        $data = $request->validated();

        return $this->respond(fn (): array => $this->yudaAi->sendMessage(
            $user,
            $data['pesan'],
            $data['conversation_id'] ?? null,
        ));
    }

    public function analyze(AnalyzeQuestionnaireRequest $request): JsonResponse
    {
        $user = $this->authenticatedUser($request);

        /** @var array{
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
         * } $answers
         */
        $answers = $request->validated();

        return $this->respond(fn (): array => $this->yudaAi->analyzeQuestionnaire(
            $user,
            $answers,
        ));
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(401);
        }

        return $user;
    }

    /**
     * @param  Closure(): array<string, mixed>  $operation
     */
    private function respond(Closure $operation): JsonResponse
    {
        try {
            return response()->json($operation());
        } catch (Throwable $exception) {
            return $this->handleAiException($exception);
        }
    }

    private function handleAiException(Throwable $exception): JsonResponse
    {
        report($exception);

        return match (true) {
            $exception instanceof RateLimitedException => $this->rateLimitedResponse($exception),
            $exception instanceof ProviderOverloadedException => response()->json([
                'code' => 'ai_provider_overloaded',
                'message' => 'Gemini sedang mengalami beban tinggi (HTTP 503). Coba kirim ulang beberapa saat lagi.',
            ], 503),
            $exception instanceof ProviderConnectionException => $this->connectionErrorResponse($exception),
            $exception instanceof AiException => response()->json([
                'code' => 'ai_provider_error',
                'message' => 'Permintaan ke layanan AI gagal. Silakan coba kembali nanti.',
            ], 502),
            default => throw $exception,
        };
    }

    private function rateLimitedResponse(RateLimitedException $exception): JsonResponse
    {
        if ($this->providerCreditsAreExhausted($exception)) {
            return response()->json([
                'code' => 'ai_provider_credits_exhausted',
                'message' => 'Kuota atau kredit Gemini sudah habis. Periksa kuota dan penagihan pada Google AI Studio atau Google Cloud.',
            ], 503);
        }

        return response()->json([
            'code' => 'ai_provider_rate_limited',
            'message' => 'Layanan AI sedang sibuk. Silakan coba kembali beberapa saat lagi.',
        ], 503);
    }

    private function connectionErrorResponse(ProviderConnectionException $exception): JsonResponse
    {
        if ($this->providerConnectionTimedOut($exception)) {
            $timeout = (int) config('ai.timeout', 20);

            return response()->json([
                'code' => 'ai_provider_timeout',
                'message' => "Gemini tidak merespons dalam batas waktu {$timeout} detik. Coba ulangi; masalahnya pada respons provider atau jalur koneksi.",
            ], 504);
        }

        return response()->json([
            'code' => 'ai_provider_unavailable',
            'message' => 'Tidak dapat terhubung ke Gemini. Silakan coba kembali beberapa saat lagi.',
        ], 503);
    }

    private function providerCreditsAreExhausted(RateLimitedException $exception): bool
    {
        $providerException = $exception->getPrevious();

        if (! $providerException instanceof RequestException) {
            return false;
        }

        $providerError = $providerException->response->json('error', []);
        $errorCode = $providerError['code'] ?? null;
        $errorMessage = mb_strtolower((string) ($providerError['message'] ?? ''));

        return in_array($errorCode, ['insufficient_quota', 'billing_hard_limit_reached'], true)
            || str_contains($errorMessage, 'no credits remaining')
            || str_contains($errorMessage, 'insufficient quota');
    }

    private function providerConnectionTimedOut(ProviderConnectionException $exception): bool
    {
        $providerException = $exception->getPrevious();

        return $providerException instanceof ConnectionException
            && str_contains(mb_strtolower($providerException->getMessage()), 'timed out');
    }
}
