<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDailyScreenTimeMatrix extends Model
{
    use HasFactory;

    public const SLOT_COLUMNS = [
        'slot_00_02',
        'slot_02_04',
        'slot_04_06',
        'slot_06_08',
        'slot_08_10',
        'slot_10_12',
        'slot_12_14',
        'slot_14_16',
        'slot_16_18',
        'slot_18_20',
        'slot_20_22',
        'slot_22_00',
    ];

    protected $fillable = [
        'user_id',
        'guest_uuid',
        'log_date',
        'slot_00_02',
        'slot_02_04',
        'slot_04_06',
        'slot_06_08',
        'slot_08_10',
        'slot_10_12',
        'slot_12_14',
        'slot_14_16',
        'slot_16_18',
        'slot_18_20',
        'slot_20_22',
        'slot_22_00',
        'instagram',
        'tiktok',
        'facebook',
        'threads',
        'youtube',
        'x',
        'total_screen_time_minutes',
        'interventions_triggered',
        'emotion',
    ];

    protected $casts = [
        'log_date' => 'date:Y-m-d',
        'slot_00_02' => 'integer',
        'slot_02_04' => 'integer',
        'slot_04_06' => 'integer',
        'slot_06_08' => 'integer',
        'slot_08_10' => 'integer',
        'slot_10_12' => 'integer',
        'slot_12_14' => 'integer',
        'slot_14_16' => 'integer',
        'slot_16_18' => 'integer',
        'slot_18_20' => 'integer',
        'slot_20_22' => 'integer',
        'slot_22_00' => 'integer',
        'instagram' => 'integer',
        'tiktok' => 'integer',
        'facebook' => 'integer',
        'threads' => 'integer',
        'youtube' => 'integer',
        'x' => 'integer',
        'total_screen_time_minutes' => 'integer',
        'interventions_triggered' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

