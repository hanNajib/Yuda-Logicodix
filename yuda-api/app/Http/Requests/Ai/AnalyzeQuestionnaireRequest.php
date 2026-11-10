<?php

namespace App\Ai;

namespace App\Http\Requests\Ai;

use App\Ai\QuestionnaireDefinition;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AnalyzeQuestionnaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Ambil aturan validasi dinamis langsung dari QuestionnaireDefinition
     * sehingga perubahan schema di backend otomatis tervalidasi tanpa merusak request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return QuestionnaireDefinition::getValidationRules();
    }
}
