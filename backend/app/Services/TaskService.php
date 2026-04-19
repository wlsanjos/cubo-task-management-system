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
     * Get a specific task by ID, scoped to the authenticated user.
     */
    public function getTaskById(int $id): Task
    {
        return Auth::user()->tasks()->findOrFail($id);
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
     * List all tasks for the authenticated user.
     */
    public function listTasks(): Collection
    {
        return Auth::user()->tasks()->latest()->get();
    }
}
