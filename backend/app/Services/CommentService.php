<?php

namespace App\Services;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class CommentService
{
    /**
     * Add a comment to a task.
     */
    public function addComment(int $taskId, array $data): Comment
    {
        $task = Task::findOrFail($taskId);

        return $task->comments()->create([
            'user_id' => Auth::id(),
            'content' => $data['content'],
        ]);
    }

    /**
     * List all comments for a specific task, ordered by date (Chat Style).
     */
    public function getTaskComments(int $taskId): Collection
    {
        $task = Task::findOrFail($taskId);

        return $task->comments()
            ->with('user')
            ->oldest()
            ->get();
    }

    /**
     * Delete a comment (Soft Delete).
     */
    public function deleteComment(int $id): bool|null
    {
        $comment = Comment::findOrFail($id);
        return $comment->delete();
    }
}
