<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Tarefas", description: "Operações relacionadas ao gerenciamento de tarefas")]
class TaskController extends Controller
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    #[OA\Get(
        path: "/api/tasks",
        summary: "Listar todas as tarefas",
        description: "Retorna uma lista de todas as tarefas pertencentes ao usuário autenticado.",
        security: [["bearerAuth" => []]],
        tags: ["Tarefas"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de tarefas recuperada com sucesso",
                content: new OA\JsonContent(type: "array", items: new OA\Items(type: "object"))
            ),
            new OA\Response(response: 401, description: "Não autorizado")
        ]
    )]
    public function index(): JsonResponse
    {
        return response()->json($this->taskService->listTasks());
    }

    #[OA\Post(
        path: "/api/tasks",
        summary: "Criar uma nova tarefa",
        description: "Cria uma tarefa e a associa ao usuário logado.",
        security: [["bearerAuth" => []]],
        tags: ["Tarefas"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["title", "status"],
                properties: [
                    new OA\Property(property: "title", type: "string", example: "Finalizar Desafio Cubo"),
                    new OA\Property(property: "description", type: "string", example: "Implementar Service Layer e CRUD de tarefas."),
                    new OA\Property(property: "status", type: "string", example: "pendente"),
                    new OA\Property(property: "due_date", type: "string", format: "date", example: "2026-12-31")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Tarefa criada com sucesso"),
            new OA\Response(response: 422, description: "Erro de validação"),
            new OA\Response(response: 401, description: "Não autorizado")
        ]
    )]
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return response()->json($task, 201);
    }

    #[OA\Get(
        path: "/api/tasks/{id}",
        summary: "Obter detalhes de uma tarefa",
        description: "Retorna os detalhes de uma única tarefa, se ela pertencer ao usuário logado.",
        security: [["bearerAuth" => []]],
        tags: ["Tarefas"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Detalhes da tarefa"),
            new OA\Response(response: 404, description: "Tarefa não encontrada"),
            new OA\Response(response: 401, description: "Não autorizado")
        ]
    )]
    public function show(int $id): JsonResponse
    {
        return response()->json($this->taskService->getTaskById($id));
    }

    #[OA\Put(
        path: "/api/tasks/{id}",
        summary: "Atualizar uma tarefa",
        description: "Atualiza os campos de uma tarefa existente.",
        security: [["bearerAuth" => []]],
        tags: ["Tarefas"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "title", type: "string"),
                    new OA\Property(property: "description", type: "string"),
                    new OA\Property(property: "status", type: "string"),
                    new OA\Property(property: "due_date", type: "string", format: "date")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Tarefa atualizada com sucesso"),
            new OA\Response(response: 404, description: "Tarefa não encontrada"),
            new OA\Response(response: 422, description: "Erro de validação"),
            new OA\Response(response: 401, description: "Não autorizado")
        ]
    )]
    public function update(UpdateTaskRequest $request, int $id): JsonResponse
    {
        $this->taskService->updateTask($id, $request->validated());
        return response()->json(['message' => 'Tarefa atualizada com sucesso']);
    }

    #[OA\Delete(
        path: "/api/tasks/{id}",
        summary: "Excluir uma tarefa (Soft Delete)",
        description: "Realiza a exclusão lógica da tarefa.",
        security: [["bearerAuth" => []]],
        tags: ["Tarefas"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Tarefa excluída com sucesso"),
            new OA\Response(response: 404, description: "Tarefa não encontrada"),
            new OA\Response(response: 401, description: "Não autorizado")
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $this->taskService->deleteTask($id);
        return response()->json(['message' => 'Tarefa movida para a lixeira']);
    }
}
