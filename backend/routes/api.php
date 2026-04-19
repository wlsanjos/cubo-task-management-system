<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas Públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Tarefas
    Route::get('/tasks/stats', [\App\Http\Controllers\Api\TaskController::class, 'stats']);
    Route::apiResource('tasks', \App\Http\Controllers\Api\TaskController::class);

    // Comentários
    Route::get('/tasks/{task}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);
});
