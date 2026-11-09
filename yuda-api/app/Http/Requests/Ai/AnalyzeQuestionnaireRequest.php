<?php

namespace App\Http\Requests\Ai;

use App\Ai\QuestionnaireOptions;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AnalyzeQuestionnaireRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'q1' => ['required', 'string', Rule::in(array_keys(QuestionnaireOptions::Q1_OPTIONS))],
            'q2' => ['sometimes', 'nullable', 'array', 'max:2'],
            'q2.*' => [
                'required',
                'string',
                Rule::in([...array_keys(QuestionnaireOptions::Q1_OPTIONS), QuestionnaireOptions::NO_OTHER_TIME_KEY]),
                'distinct:strict',
            ],
            'q3' => ['required', 'array', 'min:1', 'max:3'],
            'q3.*' => [
                'required',
                'string',
                Rule::in(array_keys(QuestionnaireOptions::Q3_OPTIONS)),
                'distinct:strict',
            ],
            'q4' => ['required', 'string', Rule::in(array_keys(QuestionnaireOptions::Q4_OPTIONS))],
            'q5' => ['required', 'string', Rule::in(array_keys(QuestionnaireOptions::Q5_OPTIONS))],
            'q6' => ['required', 'array', 'min:1', 'max:2'],
            'q6.*' => [
                'required',
                'string',
                Rule::in(array_keys(QuestionnaireOptions::Q6_OPTIONS)),
                'distinct:strict',
            ],
            'q7' => ['required', 'array', 'min:1', 'max:2'],
            'q7.*' => [
                'required',
                'string',
                Rule::in(array_keys(QuestionnaireOptions::Q7_OPTIONS)),
                'distinct:strict',
            ],
            'q8' => ['required', 'array', 'min:1', 'max:2'],
            'q8.*' => [
                'required',
                'string',
                Rule::in(array_keys(QuestionnaireOptions::Q8_OPTIONS)),
                'distinct:strict',
            ],
            'q9' => ['required', 'string', Rule::in(array_keys(QuestionnaireOptions::Q9_OPTIONS))],
            'q10' => ['required', 'array', 'min:1', 'max:2'],
            'q10.*' => [
                'required',
                'string',
                Rule::in(array_keys(QuestionnaireOptions::Q10_OPTIONS)),
                'distinct:strict',
            ],
            'conversation_id' => ['sometimes', 'nullable', 'uuid'],
        ];
    }
}
