<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AiController;
use App\Http\Controllers\Api\InterventionController;

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
Route::post('/questionnaire/analyze', [AiController::class, 'analyzeGuest'])->name('api.questionnaire.analyze.guest');

// Fitur Intervensi, Matriks Screen Time & Pesan Cukup Tau
Route::prefix('intervention')->group(function () {
    // 1. Matriks Harian (Create/Upsert & Read 1 Bulan)
    Route::post('/matrix', [InterventionController::class, 'upsertMatrix'])->name('api.intervention.matrix.upsert');
    Route::get('/matrix', [InterventionController::class, 'getMonthlyMatrices'])->name('api.intervention.matrix.monthly');

    // 2. Pesan Kartu Cukup Tau Acak (Personalisasi: emotion, trigger_condition, tone_style)
    Route::get('/random-message', [InterventionController::class, 'getRandomMessage'])->name('api.intervention.random_message');

    // 3. Manajemen Pesan (Create Single/Bulk & Delete)
    Route::post('/messages', [InterventionController::class, 'storeMessages'])->name('api.intervention.messages.store');
    Route::delete('/messages/{id}', [InterventionController::class, 'deleteMessage'])->name('api.intervention.messages.delete');

    // 4. Konfigurasi Setting User (Read & Update)
    Route::get('/settings', [InterventionController::class, 'getSettings'])->name('api.intervention.settings.get');
    Route::post('/settings', [InterventionController::class, 'updateSettings'])->name('api.intervention.settings.update');
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ai/questionnaire', [AiController::class, 'analyze'])->name('api.ai.questionnaire');
    Route::post('/ai/questionnaire/feedback', [AiController::class, 'feedback'])->name('api.ai.questionnaire.feedback');
});