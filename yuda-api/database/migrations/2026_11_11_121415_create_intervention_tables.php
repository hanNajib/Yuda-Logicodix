<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Pool pesan kartu cukup tau
        Schema::create('intervention_messages', function (Blueprint $table) {
            $table->id();
            $table->string('emotion', 50)->index();             // lelah, bosan, stres, kesepian, otomatis, dll
            $table->string('trigger_condition', 50)->index();   // jam_rawan, scroll_terlalu_lama, checkin_dashboard
            $table->string('tone_style', 50)->default('empati');// empati, to_the_point, reflektif (sesuai Q9)
            $table->string('header');                           // "Kamu Merasa Lelah Hari Ini Ya?"
            $table->text('message');                            // Isi refleksi
            $table->text('tips')->nullable();                   // Kotak tips mini
            $table->string('micro_habit_type', 50)->default('tarik_nafas'); // tarik_nafas, minum_air, peregangan, mata_20_20, basuh_muka
            $table->string('micro_habit_instruction')->nullable(); // "Pejamkan mata, tarik nafas perlahan..."
            $table->string('source', 20)->default('seed');      // seed, ai
            $table->unsignedInteger('usage_count')->default(0); // Tracking frekuensi tampil
            $table->timestamps();
        });

        // 2. Setting jeda user & evaluasi progres mingguan
        Schema::create('user_intervention_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_uuid', 64)->nullable()->index(); // ID unik perangkat jika guest
            $table->string('tone_style', 50)->default('lembut');
            $table->unsignedInteger('scroll_interval_minutes')->default(15);
            $table->unsignedInteger('current_pause_duration')->default(30); // Default 30s, min 30s, max 60s
            $table->unsignedInteger('last_pause_duration')->default(30);
            $table->unsignedInteger('previous_week_screen_time_minutes')->default(0);
            $table->unsignedInteger('current_week_screen_time_minutes')->default(0);
            $table->boolean('has_pending_alert')->default(false); // Flag notifikasi perubahan durasi
            $table->enum('alert_type', ['escalation', 'reward', 'none'])->default('none'); // escalation (+5s), reward (-5s)
            $table->string('alert_message')->nullable();
            $table->timestamp('last_evaluated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_intervention_settings');
        Schema::dropIfExists('intervention_messages');
    }
};
