<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Cubo Task Management System API",
    version: "1.0.0",
    description: "API para o sistema de gerenciamento de tarefas do Cubo. Inclui autenticação via Sanctum e operações CRUD de tarefas.",
    contact: new OA\Contact(email: "suporte@exemplo.com")
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Servidor de Desenvolvimento"
)]
#[OA\SecurityScheme(
    securityScheme: "bearerAuth",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Insira o token Bearer retornado no login para acessar rotas protegidas."
)]
abstract class Controller
{
    //
}
