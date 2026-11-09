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
        Schema::create('questionnaire_analyses', function (Blueprint $table) {
            $table->id();
            $table->string('pattern_hash', 64)->unique();
            $table->json('answers');
            $table->json('analysis');
            $table->string('source', 32)->default('gemini');
            $table->unsignedInteger('hit_count')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questionnaire_analyses');
    }
};
