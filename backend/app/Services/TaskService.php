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
     * Export tasks to PDF with professional styling.
     */
    public function exportToPdf(array $filters): \Barryvdh\DomPDF\PDF
    {
        // For PDF, we load all filtered data. 
        // If the volumes are extremely large, a separate queue job would be needed,
        // but for standard exports, we load the collection.
        $tasks = $this->prepareTaskQuery($filters)->get();

        return Pdf::loadView('reports.tasks-export', [
            'tasks' => $tasks,
            'generated_at' => now()->format('d/m/Y H:i'),
        ])->setPaper('a4', 'landscape');
    }

    /**
     * Get dashboard statistics for the authenticated user.
     */
    public function getDashboardStats(): array
    {
        $baseQuery = Auth::user()->tasks();

        $totalTasks = (clone $baseQuery)->count();
        $pendingTasks = (clone $baseQuery)->where('status', 'pendente')->count();
        $inProgressTasks = (clone $baseQuery)->where('status', 'em_andamento')->count();
        $completedTasks = (clone $baseQuery)->where('status', 'concluida')->count();

        $completionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 2) : 0;

        $overdueTasks = (clone $baseQuery)
            ->where('status', '!=', 'concluida')
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now())
            ->count();

        return [
            'total_tasks' => $totalTasks,
            'pending_tasks' => $pendingTasks,
            'in_progress_tasks' => $inProgressTasks,
            'completed_tasks' => $completedTasks,
            'completion_rate' => $completionRate,
            'overdue_tasks' => $overdueTasks,
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
