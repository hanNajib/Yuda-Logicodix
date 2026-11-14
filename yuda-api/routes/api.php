<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AiController;
use App\Http\Controllers\Api\InterventionController;
use App\Http\Controllers\Api\SocialScreenTimeController;
use App\Http\Controllers\Api\TaskController;

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
Route::post('/questionnaire/analyze', [AiController::class, 'analyzeGuest'])->name('api.questionnaire.analyze.guest');

// Fitur Intervensi, Matriks Screen Time & Pesan Cukup Tau
Route::prefix('intervention')->group(function () {
    // 1. Matriks Harian (Create/Upsert & Read) - Optional Sanctum Auth
    Route::post('/matrix', [InterventionController::class, 'upsertMatrix'])->name('api.intervention.matrix.upsert');
    Route::get('/matrix', [InterventionController::class, 'getMonthlyMatrices'])->name('api.intervention.matrix.monthly');
    Route::get('/matrix/daily', [InterventionController::class, 'getDailyMatrix'])->name('api.intervention.matrix.daily');

    // 2. Pesan Kartu Cukup Tau Acak (Personalisasi: emotion, trigger_condition, tone_style)
    Route::get('/random-message', [InterventionController::class, 'getRandomMessage'])->name('api.intervention.random_message');

    // 3. Manajemen Pesan (Create Single/Bulk & Delete)
    Route::post('/messages', [InterventionController::class, 'storeMessages'])->name('api.intervention.messages.store');
    Route::delete('/messages/{id}', [InterventionController::class, 'deleteMessage'])->name('api.intervention.messages.delete');

    // 4. Konfigurasi Setting User (Read & Update) - Support optional sanctum auth & guest
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/settings', [InterventionController::class, 'getSettings'])->name('api.intervention.settings.get');
        Route::post('/settings', [InterventionController::class, 'updateSettings'])->name('api.intervention.settings.update');
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ai/questionnaire', [AiController::class, 'analyze'])->name('api.ai.questionnaire');
    Route::post('/ai/questionnaire/feedback', [AiController::class, 'feedback'])->name('api.ai.questionnaire.feedback');
});

// Social Media Screen Time Tracker (public: support guest & logged-in user)
Route::post('/screen-time/social', [SocialScreenTimeController::class, 'update'])->name('api.screen_time.social.update');
Route::get('/screen-time/social', [SocialScreenTimeController::class, 'show'])->name('api.screen_time.social.show');

// Task List CRUD (public: support guest & logged-in user)
Route::get('/tasks', [TaskController::class, 'index'])->name('api.tasks.index');
Route::post('/tasks', [TaskController::class, 'store'])->name('api.tasks.store');
Route::put('/tasks/{id}', [TaskController::class, 'update'])->name('api.tasks.update');
Route::patch('/tasks/{id}/complete', [TaskController::class, 'toggleComplete'])->name('api.tasks.complete');
Route::delete('/tasks/{id}', [TaskController::class, 'destroy'])->name('api.tasks.destroy');