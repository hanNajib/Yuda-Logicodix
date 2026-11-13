<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterventionGenerationRun extends Model
{
    use HasFactory;

    protected $table = 'intervention_generation_runs';

    protected $fillable = [
        'period_key',
        'status',
        'total_combinations',
        'total_batches',
        'completed_batches',
        'failed_batches',
        'total_generated',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'total_combinations' => 'integer',
        'total_batches' => 'integer',
        'completed_batches' => 'integer',
        'failed_batches' => 'integer',
        'total_generated' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function batches(): HasMany
    {
        return $this->hasMany(InterventionGenerationBatch::class, 'generation_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(InterventionMessage::class, 'generation_id');
    }

    /**
     * Scope untuk mengambil generasi yang sedang aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}

