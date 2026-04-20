<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TaskAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_attachments_of_their_own_task()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);
        Attachment::factory()->count(3)->create(['task_id' => $task->id]);

        $response = $this->actingAs($user)->getJson("/api/tasks/{$task->id}/attachments");

        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_user_can_upload_an_attachment_to_their_task()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->create('document.jpg', 100);

        $response = $this->actingAs($user)->postJson("/api/tasks/{$task->id}/attachments", [
            'file' => $file
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Anexo enviado com sucesso.');

        $attachment = Attachment::first();
        Storage::disk('public')->assertExists($attachment->file_path);
        $this->assertEquals('document.jpg', $attachment->original_name);
    }

    public function test_upload_validates_file_extension()
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        // Invalid extension
        $file = UploadedFile::fake()->create('malicious.exe', 100);

        $response = $this->actingAs($user)->postJson("/api/tasks/{$task->id}/attachments", [
            'file' => $file
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['file']);
    }

    public function test_user_can_download_their_attachment()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);
        
        $filePath = 'attachments/test.jpg';
        Storage::disk('public')->put($filePath, 'fake content');

        $attachment = Attachment::factory()->create([
            'task_id' => $task->id,
            'file_path' => $filePath,
            'original_name' => 'original.jpg'
        ]);

        $response = $this->actingAs($user)->get("/api/tasks/{$task->id}/attachments/{$attachment->id}");

        $response->assertStatus(200)
                 ->assertHeader('Content-Disposition', 'attachment; filename=original.jpg');
    }

    public function test_user_can_delete_their_attachment()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);
        
        $filePath = 'attachments/deleteme.jpg';
        Storage::disk('public')->put($filePath, 'content');

        $attachment = Attachment::factory()->create([
            'task_id' => $task->id,
            'file_path' => $filePath
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/tasks/{$task->id}/attachments/{$attachment->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('attachments', ['id' => $attachment->id]);
        Storage::disk('public')->assertMissing($filePath);
    }

    public function test_user_cannot_access_another_users_attachments()
    {
        $owner = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $owner->id]);
        $attachment = Attachment::factory()->create(['task_id' => $task->id]);

        $intruder = User::factory()->create();

        // Try to list
        $this->actingAs($intruder)->getJson("/api/tasks/{$task->id}/attachments")
             ->assertStatus(403);

        // Try to upload
        $file = UploadedFile::fake()->create('stolen.jpg', 100);
        $this->actingAs($intruder)->postJson("/api/tasks/{$task->id}/attachments", ['file' => $file])
             ->assertStatus(403);

        // Try to download
        $this->actingAs($intruder)->get("/api/tasks/{$task->id}/attachments/{$attachment->id}")
             ->assertStatus(403);

        // Try to delete
        $this->actingAs($intruder)->deleteJson("/api/tasks/{$task->id}/attachments/{$attachment->id}")
             ->assertStatus(403);
    }
}
