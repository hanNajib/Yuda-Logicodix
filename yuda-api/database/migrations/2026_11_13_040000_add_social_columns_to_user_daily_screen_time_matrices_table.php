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
        Schema::table('user_daily_screen_time_matrices', function (Blueprint $table) {
            $table->unsignedSmallInteger('instagram')->default(0)->after('slot_22_00');
            $table->unsignedSmallInteger('tiktok')->default(0)->after('instagram');
            $table->unsignedSmallInteger('facebook')->default(0)->after('tiktok');
            $table->unsignedSmallInteger('threads')->default(0)->after('facebook');
            $table->unsignedSmallInteger('youtube')->default(0)->after('threads');
            $table->unsignedSmallInteger('x')->default(0)->after('youtube');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_daily_screen_time_matrices', function (Blueprint $table) {
            $table->dropColumn(['instagram', 'tiktok', 'facebook', 'threads', 'youtube', 'x']);
        });
    }
};

