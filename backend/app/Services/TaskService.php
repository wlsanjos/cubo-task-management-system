<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Barryvdh\DomPDF\Facade\Pdf;

class TaskService
{
    /**
     * Create a new task for the authenticated user.
     */
    public function createTask(array $data): Task
    {
        return Auth::user()->tasks()->create($data);
    }

    /**
     * Update an existing task.
     */
    public function updateTask(int $id, array $data): bool
    {
        $task = $this->getTaskById($id);
        return $task->update($data);
    }

    /**
     * Get a specific task by ID.
     * Note: This will be filtered by the Global Scope unless we specify otherwise.
     */
    public function getTaskById(int $id): Task
    {
        return Task::findOrFail($id);
    }

    /**
     * Find a task even if it's not the current user's (for authorization checks).
     */
    public function findTaskForAuthorization(int $id): Task
    {
        return Task::withoutGlobalScopes()->findOrFail($id);
    }

    /**
     * Delete (Soft Delete) a task.
     */
    public function deleteTask(int $id): bool|null
    {
        $task = $this->getTaskById($id);
        return $task->delete();
    }

    /**
     * List tasks for the authenticated user with filtering and pagination.
     */
    public function listTasks(array $filters = [], int $perPage = 10): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->prepareTaskQuery($filters)->paginate($perPage);
    }

    /**
     * Prepare a query for tasks based on filters.
     */
    protected function prepareTaskQuery(array $filters): Builder
    {
        return Auth::user()->tasks()->getQuery()
            ->status($filters['status'] ?? null)
            ->dateRange($filters['start_date'] ?? null, $filters['end_date'] ?? null)
            ->search($filters['search'] ?? null)
            ->when(isset($filters['start_date']) || isset($filters['end_date']), 
                fn($q) => $q->orderBy('due_date', 'asc'),
                fn($q) => $q->latest()
            );
    }

    /**
     * Export tasks to CSV using streamed response for memory efficiency.
     */
    public function exportToCsv(array $filters): StreamedResponse
    {
        $fileName = 'tasks_export_' . now()->format('Y-m-d_His') . '.csv';
        
        $response = new StreamedResponse(function () use ($filters) {
            $handle = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility (UTF-8)
            fputs($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Headers
            fputcsv($handle, ['ID', 'Título', 'Status', 'Vencimento', 'Criado em']);

            // Process in chunks to keep memory usage low
            $this->prepareTaskQuery($filters)->chunk(200, function ($tasks) use ($handle) {
                foreach ($tasks as $task) {
                    fputcsv($handle, [
                        $task->id,
                        $task->title,
                        $task->status,
                        $task->due_date ? $task->due_date->format('Y-m-d') : '-',
                        $task->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$fileName}\"");

        return $response;
    }

    /**
     * Export tasks to PDF with professional styling and executive metrics.
     */
    public function exportToPdf(array $filters): \Barryvdh\DomPDF\PDF
    {
        $tasks = $this->prepareTaskQuery($filters)->with('user')->get();
        $stats = $this->calculateAdvancedStats($tasks);

        return Pdf::loadView('reports.tasks-export', [
            'tasks' => $tasks,
            'stats' => $stats,
            'generated_at' => now()->format('d/m/Y H:i'),
            'responsible' => Auth::user()->name,
        ])->setPaper('a4', 'landscape');
    }

    /**
     * Get dashboard statistics for the authenticated user.
     */
    public function getDashboardStats(): array
    {
        $tasks = Auth::user()->tasks()->with('user')->get();
        return $this->calculateAdvancedStats($tasks);
    }

    /**
     * Calculate advanced metrics from a collection of tasks.
     */
    protected function calculateAdvancedStats(Collection $tasks): array
    {
        $total = $tasks->count();
        $completed = $tasks->where('status', 'concluida');
        $completedCount = $completed->count();
        
        $pendingTasks = $tasks->where('status', 'pendente')->count();
        $inProgressTasks = $tasks->where('status', 'em_andamento')->count();
        
        $completionRate = $total > 0 ? round(($completedCount / $total) * 100, 1) : 0;

        // Avg Resolution Time (in hours)
        $avgResolutionTime = 0;
        if ($completedCount > 0) {
            $totalHours = $completed->reduce(function ($carry, $task) {
                return $carry + $task->created_at->diffInHours($task->updated_at);
            }, 0);
            $avgResolutionTime = round($totalHours / $completedCount, 1);
        }

        // Success Rate (Completed on or before due_date)
        $successCount = $completed->filter(function ($task) {
            return !$task->due_date || $task->updated_at->startOfDay() <= $task->due_date->startOfDay();
        })->count();
        $successRate = $total > 0 ? round(($successCount / $total) * 100, 1) : 0;

        // Critical Tasks (Overdue and not completed)
        $criticalTasks = $tasks->filter(function ($task) {
            return $task->status !== 'concluida' && $task->due_date && $task->due_date->isPast();
        })->count();

        // Weekly Volume (Last 7 days)
        $weeklyVolume = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $date->translatedFormat('D');
            $weeklyVolume[] = [
                'day' => strtoupper($dayName),
                'completed' => $tasks->where('status', 'concluida')
                    ->filter(fn($t) => $t->updated_at->isSameDay($date))->count(),
                'pending' => $tasks->where('status', '!=', 'concluida')
                    ->filter(fn($t) => $t->created_at->isSameDay($date))->count(),
            ];
        }

        // Team Performance (Grouped by User)
        $teamPerformance = $tasks->groupBy('user_id')->map(function ($userTasks) {
            $uTotal = $userTasks->count();
            $uCompleted = $userTasks->where('status', 'concluida')->count();
            return [
                'name' => $userTasks->first()->user->name ?? 'Usuário',
                'role' => 'Membro da Equipe', // Could be dynamic if user has role
                'active' => $uTotal - $uCompleted,
                'completed' => $uCompleted,
                'efficiency' => $uTotal > 0 ? round(($uCompleted / $uTotal) * 100) : 0,
            ];
        })->values()->toArray();

        return [
            'total_tasks' => $total,
            'pending_tasks' => $pendingTasks,
            'in_progress_tasks' => $inProgressTasks,
            'completed_tasks' => $completedCount,
            'completion_rate' => $completionRate,
            'avg_resolution_time' => $avgResolutionTime,
            'success_rate' => $successRate,
            'critical_tasks' => $criticalTasks,
            'weekly_volume' => $weeklyVolume,
            'team_performance' => $teamPerformance,
        ];
    }

    public function uploadAttachment(Task $task, \Illuminate\Http\UploadedFile $file): \App\Models\Attachment
    {
        $path = $file->store('attachments', 'public');

        return $task->attachments()->create([
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }
}
