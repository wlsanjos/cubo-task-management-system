# Backend (Laravel)

Este é o motor do sistema, desenvolvido em **Laravel 11**. Ele fornece uma API REST robusta para gerenciamento de tarefas, comentários e geração de relatórios, com foco em performance e segurança.

---

## 🛠 Stack Técnica & Performance

- **Framework:** Laravel 11
- **PHP:** Versão 8.4 (Otimizado com JIT)
- **Autenticação:** Sanctum (Stateful/Token-based)
- **Documentação:** Swagger (L5-Swagger)
- **Geração de PDF:** DomPDF (com suporte a extensões GD/WebP)

### ⚡ Otimização de Produção
Para garantir o tempo de resposta mínimo, o build de produção no Docker realiza automaticamente:
- `php artisan config:cache`: Unifica todas as configurações em um único arquivo.
- `php artisan route:cache`: Pré-compila todas as rotas para busca instantânea.
- `php artisan view:cache`: Garante que todos os templates Blade já estejam compilados.

---

## 🏗 Arquitetura e Organização

### Lógica de Negócio (Services)
Seguimos o padrão de **Service Layer**. Toda a lógica complexa (cálculos estatísticos e filtros de exportação) reside em `app/Services`, mantendo os Controllers enxutos e focados apenas em requisição/resposta.

### Segurança e Permissões
- **Isolamento de Dados:** Cada usuário possui acesso exclusivo às suas próprias tarefas via **Laravel Policies**.
- **Resiliência:** Implementação de **Soft Deletes** para evitar perda permanente de dados críticos.
- **Validação:** Requests 100% tipadas e validadas antes de atingirem a camada de persistência.

---

## 📊 Relatórios e Dados

A API possui endpoints especializados:
- `/api/tasks/stats`: Dashboard data (progresso, volume semanal).
- `/api/tasks/export/pdf`: Relatório formatado via DomPDF.
- `/api/tasks/export/csv`: Exportação bruta para análise em planilhas.

---

## 🧪 Desenvolvimento e Qualidade

### Swagger (Explore os endpoints)
Com o sistema rodando, teste cada rota em tempo real:
`http://localhost:8000/api/documentation`

### Suíte de Testes
Garantia de funcionamento das regras de negócio:
```bash
php artisan test
```

### Padronização
O projeto utiliza o **Laravel Pint** para garantir que o código siga estritamente as recomendações PSR-12:
```bash
./vendor/bin/pint
```

---
Desenvolvido com foco em excelência técnica e escalabilidade.
