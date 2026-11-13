<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\JsonSchema\Types\Type;
use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Concerns\RemembersConversations;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[MaxTokens(800)]
#[Temperature(0.7)]
class FastGeminiAssistant implements Agent, Conversational, HasProviderOptions, HasStructuredOutput
{
    use Promptable;
    use RemembersConversations;

    public function instructions(): string
    {
        return implode(' ', [
            'Kamu adalah asisten pendamping YUDA yang ramah, ringkas, empatik, dan selalu menjawab dalam bahasa Indonesia.',
            'Tugas utamamu adalah menganalisis hasil kuesioner onboarding untuk 3 layar UI mobile secara presisi, padat, dan langsung ke inti.',
            'Layar 1 fokus pada kesadaran waktu scrolling (headline pertanyaan jam & subteks empatik).',
            'Layar 2 menyajikan tepat 3 kartu alternatif aktivitas positif dengan kalkulasi realistis berdasarkan nilai hidup pengguna.',
            'Layar 3 menyajikan profil tipe doomscrolling, catatan kebiasaan, dan afirmasi aksi jeda jika-maka nyata.',
            'Jangan pernah mendiagnosis medis, menghakimi, atau menggunakan toxic positivity klise.',
            'Tulis afirmasi jika-maka selalu sebagai AKSI POSITIF NYATA (bukan larangan "jangan buka HP").',
            'Jangan pernah melabeli Night Owl kecuali kronotipe malam (Q4) valid.',
        ]);
    }

    /**
     * @return array<string, Type>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'layar_1_insight_waktu' => $schema->object(fn (JsonSchema $schema): array => [
                'headline' => $schema->string()->required(),
                'subteks' => $schema->string()->required(),
            ])->required(),
            'layar_2_alternatif_aktivitas' => $schema->array()->items(
                $schema->object(fn (JsonSchema $schema): array => [
                    'kategori' => $schema->string()->enum(['membaca', 'sosial', 'olahraga', 'produktif', 'mindfulness'])->required(),
                    'judul' => $schema->string()->required(),
                    'deskripsi' => $schema->string()->required(),
                ])->required()
            )->required(),
            'layar_3_tipe_doomscrolling' => $schema->object(fn (JsonSchema $schema): array => [
                'nama_tipe' => $schema->string()->required(),
                'subtipe_note' => $schema->string()->required(),
                'deskripsi_kecenderungan' => $schema->string()->required(),
                'afirmasi_jeda' => $schema->string()->required(),
                'waktu_tayang' => $schema->string()->required(),
            ])->required(),
            'jawaban' => $schema->string()->required(),
        ];
    }

    public function providerOptions(Lab|string $provider): array
    {
        return [];
    }
}
