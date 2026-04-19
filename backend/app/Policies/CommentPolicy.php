<?php

namespace App\Policies;

use App\Models\Comment;
use App\Models\User;
use App\Models\Task;
use Illuminate\Auth\Access\Response;

class CommentPolicy
{
    /**
     * Determine whether the user can create a comment on a specific task.
     * Only the task owner can comment for now.
     */
    public function create(User $user, Task $task): bool
    {
        return $user->id === $task->user_id;
    }

    /**
     * Determine whether the user can delete the comment.
     * Only the author can delete their own comment.
     */
    public function delete(User $user, Comment $comment): bool
    {
        return $user->id === $comment->user_id;
    }
}
