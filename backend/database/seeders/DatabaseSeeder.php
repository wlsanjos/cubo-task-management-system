<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar um usuário de teste específico
        $testUser = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);

        // Criar 5 usuários, cada um com tarefas e comentários
        User::factory(5)->create()->each(function ($user) {
            // Cada usuário terá entre 3 e 7 tarefas
            Task::factory(rand(3, 7))->create([
                'user_id' => $user->id
            ])->each(function ($task) {
                // Cada tarefa terá entre 0 e 5 comentários
                Comment::factory(rand(0, 5))->create([
                    'task_id' => $task->id,
                    'user_id' => User::all()->random()->id // Comentário pode ser de qualquer usuário
                ]);
            });
        });

        // Adicionar tarefas também para o usuário admin
        Task::factory(5)->create([
            'user_id' => $testUser->id
        ])->each(function ($task) {
            Comment::factory(rand(2, 4))->create([
                'task_id' => $task->id,
                'user_id' => User::all()->random()->id
            ]);
        });
    }
}
