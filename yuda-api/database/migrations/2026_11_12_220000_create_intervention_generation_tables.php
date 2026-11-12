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
        // 1. Tabel riwayat proses generasi mingguan
        Schema::create('intervention_generation_runs', function (Blueprint $table) {
            $table->id();
            $table->string('period_key', 20)->unique(); // Contoh: 2026-W46
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'active', 'archived'])->default('pending');
            $table->unsignedSmallInteger('total_combinations')->default(60);
            $table->unsignedSmallInteger('total_batches')->default(12);
            $table->unsignedSmallInteger('completed_batches')->default(0);
            $table->unsignedSmallInteger('failed_batches')->default(0);
            $table->unsignedSmallInteger('total_generated')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        // 2. Tabel batch sementara (menampung 15 pesan per batch sebelum validasi)
        Schema::create('intervention_generation_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('generation_id')->constrained('intervention_generation_runs')->cascadeOnDelete();
            $table->unsignedSmallInteger('batch_number');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->json('combinations'); // 5 kombinasi [emotion, trigger, tone]
            $table->json('result')->nullable(); // 15 pesan hasil generate Gemini
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['generation_id', 'batch_number'], 'unique_gen_batch');
            $table->index('status');
        });

        // 3. Update tabel intervention_messages: tambah generation_id dan composite index
        Schema::table('intervention_messages', function (Blueprint $table) {
            $table->foreignId('generation_id')
                ->nullable()
                ->after('id')
                ->constrained('intervention_generation_runs')
                ->nullOnDelete();

            // Composite index untuk performa query cepat saat runtime
            $table->index(
                ['generation_id', 'emotion', 'trigger_condition', 'tone_style'],
                'idx_intervention_runtime_lookup'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('intervention_messages', function (Blueprint $table) {
            $table->dropForeign(['generation_id']);
            $table->dropIndex('idx_intervention_runtime_lookup');
            $table->dropColumn('generation_id');
        });

        Schema::dropIfExists('intervention_generation_batches');
        Schema::dropIfExists('intervention_generation_runs');
    }
};

