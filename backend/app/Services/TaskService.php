<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

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
        return Auth::user()->tasks()
            ->status($filters['status'] ?? null)
            ->dateRange($filters['start_date'] ?? null, $filters['end_date'] ?? null)
            ->search($filters['search'] ?? null)
            ->latest()
            ->paginate($perPage);
    }
}
