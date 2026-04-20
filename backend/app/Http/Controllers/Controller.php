<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "Cubo Task Management System API",
    version: "1.0.0",
    description: "API para o sistema de gerenciamento de tarefas do Cubo. \n\n**Segurança**:\n- **Rate Limiting**: 60 requisições/minuto (geral) e 10 requisições/minuto (login/registro).\n- **Headers de Segurança**: Proteções XSS, clickjacking, MIME-sniffing e HSTS ativos.\n- **Autenticação**: Sanctum com operações CRUD de tarefas.",
    contact: new OA\Contact(email: "suporte@exemplo.com")
)]
#[OA\Server(
    url: L5_SWAGGER_CONST_HOST,
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
