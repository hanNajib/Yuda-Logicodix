<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;


#[Fillable(['user_id', 'code_hash', 'expires_at', 'used_at'])]
class OauthLoginCode extends Model
{
    

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }   

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
