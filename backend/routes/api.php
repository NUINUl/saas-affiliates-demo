<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AffiliateDashboardController;
use App\Http\Controllers\Api\TrackClickController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/track/click', [TrackClickController::class, 'store']);

Route::middleware('auth:api')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/affiliate/dashboard', [AffiliateDashboardController::class, 'show']);
});
