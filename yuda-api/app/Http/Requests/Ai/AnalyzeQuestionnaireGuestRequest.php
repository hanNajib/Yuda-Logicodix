<?php

namespace App\Http\Requests\Ai;

use App\Ai\QuestionnaireDefinition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AnalyzeQuestionnaireGuestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Gunakan aturan validasi dinamis yang sama dengan endpoint authenticated.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return QuestionnaireDefinition::getValidationRules();
    }
}

