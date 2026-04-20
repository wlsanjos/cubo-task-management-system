<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttachmentRequest;
use App\Models\Attachment;
use App\Models\Task;
use App\Services\TaskService;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

#[OA\Tag(name: 'Anexos', description: 'Gerenciamento de arquivos e anexos das tarefas')]
class TaskAttachmentController extends Controller
{
    protected $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    #[OA\Get(
        path: '/api/tasks/{task}/attachments',
        summary: 'Listar anexos da tarefa',
        description: 'Retorna a lista de todos os arquivos anexados a uma tarefa específica.',
        security: [['bearerAuth' => []]],
        tags: ['Anexos'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de anexos',
                content: new OA\JsonContent(type: 'array', items: new OA\Items(type: 'object'))
            ),
            new OA\Response(response: 403, description: 'Proibido'),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada')
        ]
    )]
    public function index(Task $task)
    {
        Gate::authorize('view', $task);

        return response()->json($task->attachments);
    }

    #[OA\Post(
        path: '/api/tasks/{task}/attachments',
        summary: 'Fazer upload de anexo',
        description: 'Envia um novo arquivo anexo para a tarefa. Limite de 5MB, formatos: jpg, png, pdf, docx.',
        security: [['bearerAuth' => []]],
        tags: ['Anexos'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    required: ['file'],
                    properties: [
                        new OA\Property(property: 'file', type: 'string', format: 'binary', description: 'Arquivo a ser enviado')
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Anexo enviado com sucesso'),
            new OA\Response(response: 422, description: 'Erro de validação'),
            new OA\Response(response: 403, description: 'Proibido'),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa não encontrada')
        ]
    )]
    public function store(StoreAttachmentRequest $request, Task $task)
    {
        // Basic authorization check - task must belong to user (Handled by Global Scope already, 
        // but explicit check is safer if scope is ever bypassed)
        Gate::authorize('update', $task);

        $attachment = $this->taskService->uploadAttachment($task, $request->file('file'));

        return response()->json([
            'message' => 'Anexo enviado com sucesso.',
            'data' => $attachment
        ], 201);
    }

    #[OA\Get(
        path: '/api/tasks/{task}/attachments/{attachment}',
        summary: 'Baixar anexo',
        description: 'Faz o download ou visualização do arquivo anexo.',
        security: [['bearerAuth' => []]],
        tags: ['Anexos'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'attachment', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Stream do arquivo'),
            new OA\Response(response: 403, description: 'Proibido'),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa ou Anexo não encontrado')
        ]
    )]
    public function show(Task $task, Attachment $attachment)
    {
        Gate::authorize('view', $task);

        if ($attachment->task_id !== $task->id) {
            abort(404);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->original_name
        );
    }

    #[OA\Delete(
        path: '/api/tasks/{task}/attachments/{attachment}',
        summary: 'Remover anexo',
        description: 'Exclui permanentemente o arquivo anexo da tarefa.',
        security: [['bearerAuth' => []]],
        tags: ['Anexos'],
        parameters: [
            new OA\Parameter(name: 'task', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'attachment', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Anexo removido com sucesso'),
            new OA\Response(response: 403, description: 'Proibido'),
            new OA\Response(response: 401, description: 'Não autorizado'),
            new OA\Response(response: 404, description: 'Tarefa ou Anexo não encontrado')
        ]
    )]
    public function destroy(Task $task, Attachment $attachment)
    {
        Gate::authorize('update', $task);

        if ($attachment->task_id !== $task->id) {
            abort(404);
        }

        \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment->file_path);
        $attachment->delete();

        return response()->json([
            'message' => 'Anexo removido com sucesso.'
        ]);
    }
}
