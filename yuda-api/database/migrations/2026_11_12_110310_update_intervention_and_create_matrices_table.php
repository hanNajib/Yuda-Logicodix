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
        // 1. Update intervention_messages agar kolom micro_habit_type menggunakan enum
        Schema::table('intervention_messages', function (Blueprint $table) {
            $table->string('micro_habit_type', 50)->default('nafas')->change();
        });

        // 2. Buat tabel matriks screen time harian (12 slot 2 jam per hari)
        Schema::create('user_daily_screen_time_matrices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_uuid', 64)->nullable()->index();
            $table->date('log_date')->index();

            // 12 Slot Waktu 2 Jam (Menit Screen Time: 0 - 120 menit)
            $table->unsignedSmallInteger('slot_00_02')->default(0);
            $table->unsignedSmallInteger('slot_02_04')->default(0);
            $table->unsignedSmallInteger('slot_04_06')->default(0);
            $table->unsignedSmallInteger('slot_06_08')->default(0);
            $table->unsignedSmallInteger('slot_08_10')->default(0);
            $table->unsignedSmallInteger('slot_10_12')->default(0);
            $table->unsignedSmallInteger('slot_12_14')->default(0);
            $table->unsignedSmallInteger('slot_14_16')->default(0);
            $table->unsignedSmallInteger('slot_16_18')->default(0);
            $table->unsignedSmallInteger('slot_18_20')->default(0);
            $table->unsignedSmallInteger('slot_20_22')->default(0);
            $table->unsignedSmallInteger('slot_22_00')->default(0);

            $table->unsignedInteger('total_screen_time_minutes')->default(0);
            $table->unsignedInteger('interventions_triggered')->default(0);

            $table->timestamps();

            $table->unique(['user_id', 'guest_uuid', 'log_date'], 'unique_user_daily_matrix');
        });

        // 3. Update tabel user_intervention_settings sesuai spesifikasi final
        Schema::table('user_intervention_settings', function (Blueprint $table) {
            $table->string('tone_style', 50)->default('empati')->after('guest_uuid');
            $table->unsignedSmallInteger('scroll_interval_minutes')->default(15)->after('tone_style');
            $table->unsignedSmallInteger('last_pause_duration')->default(30)->after('current_pause_duration');

            // Hapus kolom alert & pembanding lama
            $table->dropColumn([
                'previous_week_screen_time_minutes',
                'current_week_screen_time_minutes',
                'has_pending_alert',
                'alert_type',
                'alert_message',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_daily_screen_time_matrices');

        Schema::table('user_intervention_settings', function (Blueprint $table) {
            $table->dropColumn(['tone_style', 'scroll_interval_minutes', 'last_pause_duration']);
            $table->unsignedInteger('previous_week_screen_time_minutes')->default(0);
            $table->unsignedInteger('current_week_screen_time_minutes')->default(0);
            $table->boolean('has_pending_alert')->default(false);
            $table->enum('alert_type', ['escalation', 'reward', 'none'])->default('none');
            $table->string('alert_message')->nullable();
        });
    }
};
