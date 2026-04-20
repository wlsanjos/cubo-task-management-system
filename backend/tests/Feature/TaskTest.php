<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_only_their_own_tasks()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        Task::factory()->count(3)->create(['user_id' => $user1->id]);
        Task::factory()->count(2)->create(['user_id' => $user2->id]);

        $response = $this->actingAs($user1)->getJson('/api/tasks');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data'); // Due to TaskResource structure (wrapping in 'data')
    }

    public function test_user_can_create_a_task()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/tasks', [
            'title' => 'Nova Tarefa de Teste',
            'description' => 'Descrição da minha tarefa.',
            'status' => 'pendente',
            'due_date' => '2026-12-31'
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.title', 'Nova Tarefa de Teste')
                 ->assertJsonPath('data.status', 'pendente');

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Nova Tarefa de Teste',
        ]);
    }

    public function test_task_creation_validates_required_fields()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/tasks', [
            // Missing title and status
            'description' => 'Testando',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title', 'status']);
    }

    public function test_user_cannot_view_another_users_task()
    {
        $owner = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $owner->id]);

        $intruder = User::factory()->create();

        $response = $this->actingAs($intruder)->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Você não tem permissão para acessar este recurso.']);
    }

    public function test_user_cannot_delete_another_users_task()
    {
        $owner = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $owner->id]);

        $intruder = User::factory()->create();

        $response = $this->actingAs($intruder)->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }

    public function test_filtering_tasks_by_status()
    {
        $user = User::factory()->create();

        Task::factory()->create(['user_id' => $user->id, 'status' => 'concluida']);
        Task::factory()->create(['user_id' => $user->id, 'status' => 'pendente']);
        Task::factory()->create(['user_id' => $user->id, 'status' => 'concluida']);

        $response = $this->actingAs($user)->getJson('/api/tasks?status=concluida');

        $response->assertStatus(200)
                 ->assertJsonCount(2, 'data');
    }

    public function test_user_can_comment_on_their_own_task()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson("/api/tasks/{$task->id}/comments", [
            'content' => 'Comentário de teste!'
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('content', 'Comentário de teste!');

        $this->assertDatabaseHas('comments', [
            'task_id' => $task->id,
            'user_id' => $user->id,
            'content' => 'Comentário de teste!',
        ]);
    }
}
