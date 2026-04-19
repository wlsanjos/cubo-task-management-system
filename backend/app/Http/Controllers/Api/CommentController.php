<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CommentResource;
use App\Services\CommentService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Comentários', description: 'Gerenciamento de comentários nas tarefas')]
class CommentController extends Controller
{
    public function __construct(
        protected CommentService $commentService,
        protected TaskService $taskService
    ) {
    }

    #[OA\Get(
        path: '/api/tasks/{task}/comments',
        summary: 'Listar comentários de uma tarefa',
        description: 'Retorna todos os comentários de uma tarefa específica em ordem cronológica.',
        security: [['bearerAuth' => []]],
        tags: ['Comentários'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de comentários',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(type: 'object'))
            ),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada')
        ]
    )]
    public function index(int $taskId): JsonResponse
    {
        // A Global Scope da Task já filtra por usuário ou lança 404
        $comments = $this->commentService->getTaskComments($taskId);
        return response()->json(CommentResource::collection($comments));
    }

    #[OA\Post(
        path: '/api/tasks/{task}/comments',
        summary: 'Adicionar comentário',
        description: 'Cria um novo comentário na tarefa. Apenas o dono da tarefa pode comentar.',
        security: [['bearerAuth' => []]],
        tags: ['Comentários'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['content'],
                properties: [
                    new OA\Property(property: 'content', type: 'string', example: 'Este é um comentário de exemplo.')
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Comentário criado com sucesso'),
            new OA\Response(response: 403, description: 'Proibido - Apenas o dono da tarefa pode comentar'),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada')
        ]
    )]
    public function store(Request $request, int $taskId): JsonResponse
    {
        $request->validate(['content' => 'required|string|max:1000']);

        $task = $this->taskService->findTaskForAuthorization($taskId);
        Gate::authorize('create', [ \App\Models\Comment::class, $task ]);

        $comment = $this->commentService->addComment($taskId, $request->all());

        return response()->json(new CommentResource($comment), 201);
    }
}
