# AGENTS.md - Frontend Task Management System

## Visão Geral
Next.js 15 + TypeScript + Tailwind CSS + Shadcn/UI
Consome API Laravel. Projeto sênior, escalável e seguro.

---

## 1. Boas Práticas de Código

### Princípios Fundamentais
- **Single Responsibility**: Componentes fazem uma coisa bem feita
- **DRY**: Extrair código repetido para hooks ou utilitários
- **Early Return**: Evitar aninhamento excessivo
- **Nomes Descritivos**: `fetchTarefas` não `getData`

### TypeScript
- ❌ NEVER usar `any`
- ✅ Usar tipos explícitos ou inferência automática
- ✅ Interfaces para objetos API
- ✅ Generics para hooks e funções reutilizáveis

### Estrutura de Arquivos
- Um arquivo por componente principal
- Nome do arquivo = Nome do componente (kebab-case)
- máximo ~300 linhas por arquivo

---

## 2. Clean Code

### Funções
- Máximo 20-30 linhas por função
- Parâmetros limitados (máx 3-4, usar objeto se necessário)
- Evitar side effects desnecessários

### Componentes React
- Server Components por padrão
- `use client` APENAS quando necessário:
  - useState/useEffect
  - event handlers
  - hooks de terceiros (react-hook-form, react-query)
- Props interface explícita

### Comentários
- ❌ NÃO comente o "o quê" (código autoexplicativo)
- ✅ Comente o "porquê" (decisões de negócio, hacks)
- ✅ JSDoc para funções públicas

---

## 3. Segurança

### Variáveis de Ambiente
- Apenas `NEXT_PUBLIC_*` no frontend
- NUNCA expor secrets/chaves no código
- Usar `.env.local` (não commitado)

### Validação
- Zod para validação de schemas
- Validar dados ANTES de enviar para API
- Validar respostas da API também

### Proteção
- Sanitizar inputs (prev XSS)
- CSRF tokens em requests stateful
- Rate limiting (via API, não implementer no frontend)

### Dados Sensíveis
- Não logar dados sensíveis
- Não armazenar tokens em localStorage (usar cookies httpOnly)
- Limpar dados ao fazer logout

---

## 4. Next.js 15+ specifics

### Server Components
- Componentes de servidor por padrão
- Fetch diretamente no componente
- Sem useState/useEffect desnecessários

### Client Components
- Marcar apenas com `use client` quando necessário
- Minimizar a árbol de componentes client
- Passar dados via props, não context para Server

### Routing
- Layouts para estrutura compartilhada
- Groups `(auth)` / `(dashboard)` para organização
- Prefetch explícito para rotas importantes

### Performance
- Suspense para streaming
- Imagens otimizadas (next/image)
- Lazy loading para rotas pesadas
- Evitar fetch em loop (use parallel requests)

### Cache
- Next.js cache automático para fetch
- React Query para estado cliente
- Revalidar com intervalo ou under mutations

---

## 5. Estrutura de Pastas

```
src/
├── app/                    # App Router
│   ├── (auth)/           # Login, register
│   ├── (dashboard)/       # Rotas protegidas
│   └── api/             # API routes (se necessário)
├── components/
│   ├── ui/              # Shadcn base
│   ├── shared/           # Sidebar, Header (layout)
│   └── features/         # TaskCard, TaskList
├── hooks/
│   ├── useAuth.ts
│   └── useTasks.ts
├── services/
│   ├── api.ts           # Axios instance
│   └── auth.ts
├── lib/
│   ├── utils.ts
│   └── constants.ts
└── types/
    └── index.ts         # Tipos globais
```

---

## 6. Conventional Commits

```
feat:     nova funcionalidade
fix:     correção de bug
refactor: refatoração (sem mudança de comportamento)
style:   formatação
docs:    documentação
test:    testes
chore:   manutenção
security: segurança
```

Exemplos:
- `feat: add task creation form`
- `fix: resolve token refresh on 401`
- `security: add input sanitization`

---

## 7. Commands de Desenvolvimento

```bash
# Development
npm run dev

# Build & Typecheck
npm run build
npm run lint

# Add Shadcn component
npx shadcn@latest add button
```

---

## 8. Checklist de Segurança por PR

- [ ] Nenhuma segredo exposta no código
- [ ] Inputs validados com Zod
- [ ] Dados sensíveis não logados
- [ ] Tokens não em localStorage
- [ ] CSRF protection ativo

---

## 9. Referências

- [Next.js Docs](https://nextjs.org/docs)
- [Shadcn/UI](https://ui.shadcn.com)
- [React Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev)