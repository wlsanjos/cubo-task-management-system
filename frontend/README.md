# Frontend (Next.js)

Este é a interface do sistema, desenvolvida com **Next.js 15**. O foco foi criar uma experiência de uso fluida, rápida e com um visual moderno e limpo.

---

## 🎨 Layout e Estilo

- **Estilização:** Usei **Tailwind CSS** para um design responsivo e fácil de manter.
- **Componentes:** A base da interface foi construída com **Shadcn UI** e **Lucide React** para ícones.
- **Visual:** O estilo segue uma linha moderna, com tons de cinza e azul (Slate), focando na legibilidade.

---

## 🛠 Principais Tecnologias

- **Framework:** Next.js 15 (App Router)
- **Gerenciamento de Dados:** **TanStack Query (React Query)** para lidar com o cache e a sincronização com a API.
- **Formulários:** **React Hook Form** + **Zod** para validações seguras.
- **Notificações:** **Sonner** para avisos de sucesso ou erro (toasts).
- **Gráficos:** Implementação de cards de indicadores e gráficos de volume para facilitar o acompanhamento.

---

## 🧠 Como o código foi pensado

### Gestão de Dados (Server State)
Em vez de usar Redux ou Context API para tudo, optei pelo **TanStack Query**. Isso permite que o sistema atualize as listas de tarefas e os números do dashboard de forma quase instantânea após qualquer mudança (como ao criar ou concluir uma tarefa).

### Funcionalidades do Usuário
- **Dashboard:** Resumo visual de como está a produtividade.
- **Gerenciamento:** CRUD completo de tarefas com filtros de status e busca.
- **Colaboração:** Sistema de comentários em cada tarefa para simular interação de equipe.
- **Relatórios:** Área dedicada para download de relatórios gerados pela API.

---

## 🚀 Como rodar localmente

Se você já rodou o `setup.sh` na raiz, o frontend já deve estar configurado. Caso queira rodar apenas ele separadamente:

1. **Acesse a pasta:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Suba o servidor de dev:**
   ```bash
   npm run dev
   ```

---
Desenvolvido como parte de um desafio técnico.
