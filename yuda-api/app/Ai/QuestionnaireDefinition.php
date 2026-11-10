<?php

namespace App\Ai;

use Illuminate\Validation\Rule;

final class QuestionnaireDefinition
{
    public const EXCLUSIVE_NO_OTHER_TIME = 'tidak_ada';

    /**
     * @return array<string, mixed>
     */
    public static function all(): array
    {
        /** @var array<string, mixed> $config */
        $config = config('questionnaire', []);

        if (empty($config)) {
            $config = require __DIR__ . '/../../config/questionnaire.php';
        }

        return $config;
    }

    public static function getIntroText(): string
    {
        return (string) (self::all()['intro'] ?? '');
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function getQuestions(): array
    {
        return self::all()['questions'] ?? [];
    }

    /**
     * Kembalikan struktur JSON bersih untuk dikonsumsi frontend mobile.
     *
     * @return array{intro: string, total_questions: int, questions: array<int, mixed>}
     */
    public static function getSchemaForFrontend(): array
    {
        $rawQuestions = self::getQuestions();
        $formatted = [];

        foreach ($rawQuestions as $id => $q) {
            $options = [];
            foreach ($q['options'] ?? [] as $optKey => $optVal) {
                $options[] = [
                    'key' => (string) $optKey,
                    'label' => $optVal['label'] ?? (string) $optVal,
                    'time_range' => $optVal['time_range'] ?? null,
                ];
            }

            $formatted[] = [
                'id' => $id,
                'role' => $q['role'] ?? $id,
                'title' => $q['title'] ?? '',
                'type' => $q['type'] ?? 'single',
                'required' => (bool) ($q['required'] ?? true),
                'min_choices' => (int) ($q['min_choices'] ?? 1),
                'max_choices' => (int) ($q['max_choices'] ?? 1),
                'exclusive_option' => $q['exclusive_option'] ?? null,
                'options' => $options,
            ];
        }

        return [
            'intro' => self::getIntroText(),
            'total_questions' => count($formatted),
            'questions' => $formatted,
        ];
    }

    /**
     * Buat aturan validasi dinamis untuk FormRequest berdasarkan schema aktif.
     *
     * @return array<string, array<int, mixed>>
     */
    public static function getValidationRules(): array
    {
        $rules = [
            'conversation_id' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];

        foreach (self::getQuestions() as $id => $q) {
            $type = $q['type'] ?? 'single';
            $required = (bool) ($q['required'] ?? true);
            $minChoices = (int) ($q['min_choices'] ?? ($required ? 1 : 0));
            $maxChoices = (int) ($q['max_choices'] ?? 1);
            $validOptionKeys = array_map('strval', array_keys($q['options'] ?? []));

            if ($type === 'single') {
                $rules[$id] = [
                    $required ? 'required' : 'nullable',
                    'string',
                    Rule::in($validOptionKeys),
                ];
            } else {
                // Multi-choice
                $fieldRules = [
                    $required ? 'required' : 'sometimes',
                    'array',
                ];

                if ($minChoices > 0) {
                    $fieldRules[] = "min:{$minChoices}";
                }
                if ($maxChoices > 0) {
                    $fieldRules[] = "max:{$maxChoices}";
                }

                $rules[$id] = $fieldRules;
                $rules["{$id}.*"] = [
                    'required',
                    'string',
                    Rule::in($validOptionKeys),
                    'distinct:strict',
                ];
            }
        }

        return $rules;
    }

    /**
     * Dapatkan teks label opsi berdasarkan ID pertanyaan dan key opsi.
     */
    public static function getOptionLabel(string $questionId, string $optionKey): string
    {
        $questions = self::getQuestions();
        $option = $questions[$questionId]['options'][$optionKey] ?? null;

        if (is_array($option)) {
            return (string) ($option['label'] ?? $optionKey);
        }

        return is_string($option) ? $option : $optionKey;
    }

    /**
     * Dapatkan mapping peran semantik untuk tiap ID pertanyaan.
     *
     * @return array<string, string> Contoh: ['q1' => 'jam_rawan_utama', ...]
     */
    public static function getRoleMap(): array
    {
        $map = [];
        foreach (self::getQuestions() as $id => $q) {
            $map[$id] = (string) ($q['role'] ?? $id);
        }

        return $map;
    }
}

