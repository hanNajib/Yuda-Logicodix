<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserTask extends Model
{
    protected $fillable = [
        'user_id',
        'guest_uuid',
        'title',
        'scheduled_date',
        'scheduled_time',
        'is_completed',
        'completed_at',
        'google_calendar_event_id',
    ];

    protected $casts = [
        'scheduled_date' => 'date:Y-m-d',
        'is_completed'   => 'boolean',
        'completed_at'   => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

