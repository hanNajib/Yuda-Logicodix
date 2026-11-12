<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InterventionMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'emotion',
        'trigger_condition',
        'tone_style',
        'header',
        'message',
        'tips',
        'micro_habit_type',
        'micro_habit_instruction',
        'source',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];
}

