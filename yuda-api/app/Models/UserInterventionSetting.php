<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserInterventionSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'guest_uuid',
        'tone_style',
        'scroll_interval_minutes',
        'current_pause_duration',
        'last_pause_duration',
        'last_evaluated_at',
    ];

    protected $casts = [
        'scroll_interval_minutes' => 'integer',
        'current_pause_duration' => 'integer',
        'last_pause_duration' => 'integer',
        'last_evaluated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
