<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('guest_uuid', 64)->nullable();
            $table->string('title');
            $table->date('scheduled_date');
            $table->time('scheduled_time')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->string('google_calendar_event_id')->nullable(); // Reserved untuk GCal
            $table->timestamps();

            // Index untuk query cepat berdasarkan tanggal
            $table->index(['user_id', 'scheduled_date']);
            $table->index(['guest_uuid', 'scheduled_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_tasks');
    }
};

