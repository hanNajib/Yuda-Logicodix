<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AiController;

Route::middleware('throttle:10,1')->group(function () {
    Route::post(
        '/auth/google/exchange',
        [GoogleAuthController::class, 'exchange']
    );

    Route::post(
        '/auth/google/native',
        [AuthController::class, 'googleNative']
    );
});

Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/user/profile', [AuthController::class, 'updateProfile']);

    Route::get('/user', function (Request $request) {
        return response()->json([
            'data' => $request->user(),
        ]);
    });

    Route::post('/auth/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    });

    
});


Route::get('/questionnaire', [AiController::class, 'questionnaire'])->name('api.questionnaire.index');

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ai/questionnaire', [AiController::class, 'analyze'])->name('api.ai.questionnaire');
    Route::post('/ai/questionnaire/feedback', [AiController::class, 'feedback'])->name('api.ai.questionnaire.feedback');
});