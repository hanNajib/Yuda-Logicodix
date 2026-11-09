<?php

namespace App\Ai;

final class QuestionnairePatternHasher
{
    /**
     * Buat fingerprint/hash unik dan deterministik dari kombinasi jawaban Q1–Q10.
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
     *     q10: array<int, string>
     * }  $answers
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
        $keys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'];
        $clean = [];

        foreach ($keys as $key) {
            $value = $answers[$key] ?? null;

            if (is_array($value)) {
                $filtered = array_values(array_filter(
                    $value,
                    static fn (mixed $item): bool => is_string($item) && $item !== QuestionnaireOptions::NO_OTHER_TIME_KEY
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
