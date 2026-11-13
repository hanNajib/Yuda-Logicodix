<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSocialScreenTime extends Model
{
    protected $fillable = [
        'user_id',
        'guest_uuid',
        'instagram',
        'tiktok',
        'facebook',
        'threads',
        'youtube',
        'x',
    ];
    

    protected $casts = [
        'instagram' => 'integer',
        'tiktok'    => 'integer',
        'facebook'  => 'integer',
        'threads'   => 'integer',
        'youtube'   => 'integer',
        'x'         => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

