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
        Schema::table('intervention_generation_runs', function (Blueprint $table) {
            if (Schema::hasColumn('intervention_generation_runs', 'error_message')) {
                $table->dropColumn('error_message');
            }
        });

        Schema::table('intervention_generation_batches', function (Blueprint $table) {
            if (Schema::hasColumn('intervention_generation_batches', 'error_message')) {
                $table->dropColumn('error_message');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('intervention_generation_runs', function (Blueprint $table) {
            $table->text('error_message')->nullable()->after('total_generated');
        });

        Schema::table('intervention_generation_batches', function (Blueprint $table) {
            $table->text('error_message')->nullable()->after('attempts');
        });
    }
};

