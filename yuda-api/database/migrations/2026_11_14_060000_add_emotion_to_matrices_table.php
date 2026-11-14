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
        if (Schema::hasTable('user_daily_screen_time_matrices')) {
            Schema::table('user_daily_screen_time_matrices', function (Blueprint $table) {
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'emotion')) {
                    $table->string('emotion', 50)->nullable()->after('interventions_triggered');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_daily_screen_time_matrices')) {
            Schema::table('user_daily_screen_time_matrices', function (Blueprint $table) {
                if (Schema::hasColumn('user_daily_screen_time_matrices', 'emotion')) {
                    $table->dropColumn('emotion');
                }
            });
        }
    }
};
