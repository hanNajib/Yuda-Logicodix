<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\MaxTokens;
use Laravel\Ai\Attributes\Temperature;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasProviderOptions;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;

#[MaxTokens(2500)]
#[Temperature(0.7)]
class InterventionBatchGeneratorAgent implements Agent, HasProviderOptions
{
    use Promptable;

    public function instructions(): string
    {
        return implode(' ', [
            'Kamu adalah AI generator pesan intervensi untuk aplikasi YUDA, dengan maskot Capybara yang hangat dan suportif.',
            'Tugas utamamu adalah menghasilkan pesan intervensi reflektif untuk membantu pengguna mengatasi doomscrolling.',
            'Kamu selalu merespons HANYA dalam format JSON array of objects yang valid tanpa teks pembuka atau penutup.',
            'Nilai ENUM harus persis sesuai instruksi: emotion (tenang, cemas, bosan, lelah), trigger_condition (jam_rawan, scroll_terlalu_lama, checkin_dashboard), tone_style (lembut, tegas, humoris, faktual, reflektif), dan micro_habit_type (nafas, minum, peregangan, tidur).',
        ]);
    }

    public function providerOptions(Lab|string $provider): array
    {
        return [];
    }
}

