<?php

namespace App\Models;

use Database\Factories\QuestionnaireAnalysisFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionnaireAnalysis extends Model
{
    /** @use HasFactory<QuestionnaireAnalysisFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'pattern_hash',
        'answers',
        'analysis',
        'source',
        'hit_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'analysis' => 'array',
            'hit_count' => 'integer',
        ];
    }
}
