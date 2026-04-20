<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Tarefas', description: 'Operações relacionadas ao gerenciamento de tarefas')]
class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {
    }

    #[OA\Get(
        path: '/api/tasks/stats',
        summary: 'Obter estatísticas do Dashboard',
        description: 'Retorna um resumo estatístico das tarefas do usuário logado para exibição no Dashboard principal.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Estatísticas recuperadas com sucesso',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'total_tasks', type: 'integer', example: 15),
                        new OA\Property(property: 'pending_tasks', type: 'integer', example: 5),
                        new OA\Property(property: 'in_progress_tasks', type: 'integer', example: 3),
                        new OA\Property(property: 'completed_tasks', type: 'integer', example: 7),
                        new OA\Property(property: 'completion_rate', type: 'number', format: 'float', example: 46.67),
                        new OA\Property(property: 'overdue_tasks', type: 'integer', example: 2)
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    public function stats(): JsonResponse
    {
        return response()->json($this->taskService->getDashboardStats());
    }

    #[OA\Get(
        path: '/api/tasks',
        summary: 'Listar todas as tarefas',
        description: 'Retorna uma lista paginada de tarefas pertencentes ao usuário autenticado, com suporte a filtros e busca.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de tarefas recuperada com sucesso',
                content: new OA\JsonContent(
                    type: 'object',
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object')),
                        new OA\Property(property: 'links', type: 'object'),
                        new OA\Property(property: 'meta', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    #[OA\Parameter(name: 'status', in: 'query', description: 'Filtrar por status', required: false, schema: new OA\Schema(type: 'string', enum: ['pendente', 'em_andamento', 'concluida']))]
    #[OA\Parameter(name: 'start_date', in: 'query', description: 'Data inicial (YYYY-MM-DD)', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
    #[OA\Parameter(name: 'end_date', in: 'query', description: 'Data final (YYYY-MM-DD)', required: false, schema: new OA\Schema(type: 'string', format: 'date'))]
    #[OA\Parameter(name: 'search', in: 'query', description: 'Busca textual no título ou descrição', required: false, schema: new OA\Schema(type: 'string'))]
    #[OA\Parameter(name: 'per_page', in: 'query', description: 'Itens por página', required: false, schema: new OA\Schema(type: 'integer', default: 10))]
    public function index(\Illuminate\Http\Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'start_date', 'end_date', 'search']);
        $perPage = (int) $request->query('per_page', 10);

        $tasks = $this->taskService->listTasks($filters, $perPage);

        return \App\Http\Resources\TaskResource::collection($tasks)->response();
    }

    #[OA\Post(
        path: '/api/tasks',
        summary: 'Criar uma nova tarefa',
        description: 'Cria uma tarefa e a associa ao usuário logado.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'status'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Finalizar Desafio Cubo'),
                    new OA\Property(property: 'description', type: 'string', example: 'Implementar Service Layer e CRUD de tarefas.'),
                    new OA\Property(property: 'status', type: 'string', example: 'pendente'),
                    new OA\Property(property: 'due_date', type: 'string', format: 'date', example: '2026-12-31')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Tarefa criada com sucesso'),
            new OA\Response(response: 422, description: 'Erro de validação'),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return (new \App\Http\Resources\TaskResource($task))
            ->response()
            ->setStatusCode(201);
    }

    #[OA\Get(
        path: '/api/tasks/{task}',
        summary: 'Obter detalhes de uma tarefa',
        description: 'Retorna os detalhes de uma única tarefa, se ela pertencer ao usuário logado.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detalhes da tarefa'),
            new OA\Response(response: 403, description: 'Proibido - Você não é o dono desta tarefa'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada'),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    public function show(\App\Models\Task $task): JsonResponse
    {
        $task->load(['comments.user']);

        Gate::authorize('view', $task);

        return response()->json(new \App\Http\Resources\TaskResource($task));
    }

    #[OA\Put(
        path: '/api/tasks/{task}',
        summary: 'Atualizar uma tarefa',
        description: 'Atualiza os campos de uma tarefa existente.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'status', type: 'string'),
                    new OA\Property(property: 'due_date', type: 'string', format: 'date')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Tarefa atualizada com sucesso'),
            new OA\Response(response: 403, description: 'Proibido - Você não é o dono desta tarefa'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada'),
            new OA\Response(response: 422, description: 'Erro de validação'),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    public function update(UpdateTaskRequest $request, \App\Models\Task $task): JsonResponse
    {
        Gate::authorize('update', $task);

        $this->taskService->updateTask($task->id, $request->validated());
        return response()->json(['message' => 'Tarefa atualizada com sucesso']);
    }

    #[OA\Delete(
        path: '/api/tasks/{task}',
        summary: 'Excluir uma tarefa (Soft Delete)',
        description: 'Realiza a exclusão lógica da tarefa.',
        security: [['bearerAuth' => []]],
        tags: ['Tarefas'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tarefa excluída com sucesso'),
            new OA\Response(response: 403, description: 'Proibido - Você não é o dono desta tarefa'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada'),
            new OA\Response(response: 401, description: 'Não autorizado')
        ]
    )]
    public function destroy(\App\Models\Task $task): JsonResponse
    {
        Gate::authorize('delete', $task);

        $this->taskService->deleteTask($task->id);
        return response()->json(['message' => 'Tarefa movida para a lixeira']);
    }
}
