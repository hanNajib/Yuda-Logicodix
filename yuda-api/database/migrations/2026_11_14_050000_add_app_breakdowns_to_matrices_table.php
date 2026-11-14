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
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'instagram')) {
                    $table->unsignedInteger('instagram')->default(0)->after('slot_22_00');
                }
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'tiktok')) {
                    $table->unsignedInteger('tiktok')->default(0)->after('instagram');
                }
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'facebook')) {
                    $table->unsignedInteger('facebook')->default(0)->after('tiktok');
                }
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'threads')) {
                    $table->unsignedInteger('threads')->default(0)->after('facebook');
                }
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'youtube')) {
                    $table->unsignedInteger('youtube')->default(0)->after('threads');
                }
                if (!Schema::hasColumn('user_daily_screen_time_matrices', 'x')) {
                    $table->unsignedInteger('x')->default(0)->after('youtube');
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
                $cols = ['instagram', 'tiktok', 'facebook', 'threads', 'youtube', 'x'];
                $toDrop = [];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('user_daily_screen_time_matrices', $col)) {
                        $toDrop[] = $col;
                    }
                }
                if (!empty($toDrop)) {
                    $table->dropColumn($toDrop);
                }
            });
        }
    }
};

