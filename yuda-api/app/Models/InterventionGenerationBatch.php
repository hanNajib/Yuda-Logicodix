<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterventionGenerationBatch extends Model
{
    use HasFactory;

    protected $table = 'intervention_generation_batches';

    protected $fillable = [
        'generation_id',
        'batch_number',
        'status',
        'combinations',
        'result',
        'attempts',
        'error_message',
    ];

    protected $casts = [
        'batch_number' => 'integer',
        'combinations' => 'array',
        'result' => 'array',
        'attempts' => 'integer',
    ];

    public function run(): BelongsTo
    {
        return $this->belongsTo(InterventionGenerationRun::class, 'generation_id');
    }
}

