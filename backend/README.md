# Backend (Laravel)

Este é o backend do sistema, desenvolvido em **Laravel 13**. Ele fornece uma API REST para gerenciamento de tarefas, comentários e geração de relatórios.

---

## 🛠 Stack Técnica

- **Framework:** Laravel 13
- **PHP:** Versão 8.4 (ou 8.3+)
- **Autenticação:** Sanctum (Token-based)
- **Documentação:** Swagger (L5-Swagger)
- **Geração de PDF:** DomPDF

---

## 🏗 Como o sistema foi organizado

### Lógica de Negócio (Services)
Para não poluir os Controllers, toda a lógica principal (como cálculos de estatísticas e filtros de exportação) fica dentro da pasta `app/Services`. Isso deixa o código mais limpo e fácil de testar.

### Segurança e Permissões
- Só usuários logados podem acessar a API.
- Cada usuário só consegue ver, editar ou excluir as suas próprias tarefas. Isso é controlado através das **Policies** do Laravel.
- Usei **Soft Deletes**, então quando uma tarefa é "excluída", ela apenas é marcada no banco, evitando perdas acidentais.

---

## 📊 Relatórios e Dados

A API possui endpoints específicos para extrair informações:
- `/api/tasks/stats`: Traz os números do dashboard (progresso, volume semanal, etc).
- `/api/tasks/export/pdf`: Gera um arquivo PDF formatado com as tarefas.
- `/api/tasks/export/csv`: Exporta os dados brutos para planilhas.

---

## 🧪 Prática e Qualidade

### Documentação da API (Explore os endpoints)
Com o sistema rodando, você pode testar cada rota pelo Swagger:
`http://localhost:8000/api/documentation`

Se fizer mudanças nas rotas e precisar atualizar o Swagger:
```bash
php artisan l5-swagger:generate
```

### Rodando Testes
Para garantir que as funcionalidades principais estão funcionando:
```bash
php artisan test
```

### Padronização de Código
Usei o **Laravel Pint** para manter o estilo do código organizado dentro dos padrões do PHP moderno:
```bash
./vendor/bin/pint
```

---
Desenvolvido como parte de um desafio técnico.
