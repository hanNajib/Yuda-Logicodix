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
        if (Schema::hasTable('user_intervention_settings')) {
            Schema::table('user_intervention_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('user_intervention_settings', 'tone_style')) {
                    $table->string('tone_style', 50)->default('lembut')->after('guest_uuid');
                }
                if (!Schema::hasColumn('user_intervention_settings', 'scroll_interval_minutes')) {
                    $table->unsignedInteger('scroll_interval_minutes')->default(15)->after('tone_style');
                }
                if (!Schema::hasColumn('user_intervention_settings', 'last_pause_duration')) {
                    $table->unsignedInteger('last_pause_duration')->default(30)->after('current_pause_duration');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_intervention_settings')) {
            Schema::table('user_intervention_settings', function (Blueprint $table) {
                $columns = [];
                if (Schema::hasColumn('user_intervention_settings', 'tone_style')) {
                    $columns[] = 'tone_style';
                }
                if (Schema::hasColumn('user_intervention_settings', 'scroll_interval_minutes')) {
                    $columns[] = 'scroll_interval_minutes';
                }
                if (Schema::hasColumn('user_intervention_settings', 'last_pause_duration')) {
                    $columns[] = 'last_pause_duration';
                }
                if (!empty($columns)) {
                    $table->dropColumn($columns);
                }
            });
        }
    }
};

