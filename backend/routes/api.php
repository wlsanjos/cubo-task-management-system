<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Rotas Públicas
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:login_register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login_register');

Route::get('/status', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});

// Rotas Protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Tarefas
    Route::get('/tasks/stats', [\App\Http\Controllers\Api\TaskController::class, 'stats']);
    Route::get('/tasks/export/csv', [\App\Http\Controllers\Api\TaskController::class, 'exportCsv']);
    Route::get('/tasks/export/pdf', [\App\Http\Controllers\Api\TaskController::class, 'exportPdf']);
    Route::apiResource('tasks', \App\Http\Controllers\Api\TaskController::class);

    // Comentários
    Route::get('/tasks/{task}/comments', [\App\Http\Controllers\Api\CommentController::class, 'index']);
    Route::post('/tasks/{task}/comments', [\App\Http\Controllers\Api\CommentController::class, 'store']);

    // Anexos
    Route::get('/tasks/{task}/attachments', [\App\Http\Controllers\Api\TaskAttachmentController::class, 'index']);
    Route::post('/tasks/{task}/attachments', [\App\Http\Controllers\Api\TaskAttachmentController::class, 'store']);
    Route::get('/tasks/{task}/attachments/{attachment}', [\App\Http\Controllers\Api\TaskAttachmentController::class, 'show']);
    Route::delete('/tasks/{task}/attachments/{attachment}', [\App\Http\Controllers\Api\TaskAttachmentController::class, 'destroy']);
});
