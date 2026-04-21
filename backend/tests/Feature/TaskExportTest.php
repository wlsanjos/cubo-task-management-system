<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskExportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_unauthenticated_user_cannot_export_csv(): void
    {
        $response = $this->getJson('/api/tasks/export/csv');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_export_pdf(): void
    {
        $response = $this->getJson('/api/tasks/export/pdf');
        $response->assertStatus(401);
    }

    public function test_user_can_export_their_own_tasks_to_csv(): void
    {
        Task::factory()->count(3)->create(['user_id' => $this->user->id]);
        
        $response = $this->actingAs($this->user)
            ->get('/api/tasks/export/csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="tasks_export_' . now()->format('Y-m-d') . '_' . now()->format('His') . '.csv"');
        
        $content = $response->streamedContent();
        $this->assertStringContainsString('ID', $content);
        $this->assertStringContainsString('Título', $content);
        $this->assertStringContainsString('Status', $content);
        $this->assertStringContainsString('Vencimento', $content);
        $this->assertStringContainsString('Criado em', $content);
    }

    public function test_user_can_export_their_own_tasks_to_pdf(): void
    {
        Task::factory()->count(2)->create(['user_id' => $this->user->id]);
        
        $response = $this->actingAs($this->user)
            ->get('/api/tasks/export/pdf');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        // Check if content starts with PDF signature
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_export_respects_filters(): void
    {
        Task::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Target Task',
            'status' => 'concluida'
        ]);
        Task::factory()->create([
            'user_id' => $this->user->id,
            'title' => 'Other Task',
            'status' => 'pendente'
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/tasks/export/csv?status=concluida');

        $content = $response->streamedContent();
        $this->assertStringContainsString('Target Task', $content);
        $this->assertStringNotContainsString('Other Task', $content);
    }

    public function test_user_cannot_export_other_users_tasks(): void
    {
        $otherUser = User::factory()->create();
        Task::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Secret Task'
        ]);

        $response = $this->actingAs($this->user)
            ->get('/api/tasks/export/csv');

        $content = $response->streamedContent();
        $this->assertStringNotContainsString('Secret Task', $content);
    }
}
