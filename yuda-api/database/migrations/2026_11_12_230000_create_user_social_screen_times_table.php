<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_social_screen_times', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_uuid', 64)->nullable()->index();
            $table->unsignedInteger('instagram')->default(0);
            $table->unsignedInteger('tiktok')->default(0);
            $table->unsignedInteger('facebook')->default(0);
            $table->unsignedInteger('threads')->default(0);
            $table->unsignedInteger('youtube')->default(0);
            $table->unsignedInteger('x')->default(0);
            $table->timestamps();

            // Pastikan 1 user/guest hanya punya 1 baris
            $table->unique(['user_id', 'guest_uuid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_social_screen_times');
    }
};

