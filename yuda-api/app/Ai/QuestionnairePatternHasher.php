<?php

namespace App\Ai;

final class QuestionnairePatternHasher
{
    /**
     * Buat fingerprint/hash unik dan deterministik dari kombinasi jawaban Q1–Q9.
     *
     * @param  array<string, mixed>  $answers
     */
    public static function hash(array $answers): string
    {
        $normalized = self::normalize($answers);

        return hash('sha256', json_encode($normalized, JSON_THROW_ON_ERROR));
    }

    /**
     * @param  array<string, mixed>  $answers
     * @return array<string, mixed>
     */
    public static function normalize(array $answers): array
    {
        $keys = array_keys(QuestionnaireDefinition::getQuestions());
        if (empty($keys)) {
            $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
        }

        $clean = [];

        foreach ($keys as $key) {
            $value = $answers[$key] ?? null;

            if (is_array($value)) {
                $filtered = array_values(array_filter(
                    $value,
                    static fn (mixed $item): bool => is_string($item) && $item !== QuestionnaireDefinition::EXCLUSIVE_NO_OTHER_TIME
                ));
                sort($filtered);
                $clean[$key] = $filtered;
            } elseif (is_string($value)) {
                $clean[$key] = trim($value);
            } else {
                $clean[$key] = null;
            }
        }

        ksort($clean);

        return $clean;
    }
}
