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


Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/ai/questionnaire', [AiController::class, 'analyze'])->name('api.ai.questionnaire');
});