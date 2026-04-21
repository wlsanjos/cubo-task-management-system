# Frontend (Next.js)

Esta é a interface inteligente do sistema, desenvolvida com **Next.js 15**. O projeto foi concebido para oferecer uma experiência de alta fidelidade, com performance otimizada para o mundo real.

---

## 🎨 Design e User Experience

- **Estilização Dinâmica:** Utilizamos **Tailwind CSS** para um design responsivo, mantendo a consistência visual em qualquer dispositivo.
- **Ecossistema UI:** Baseado em **Shadcn UI** e **Lucide React**, garantindo componentes acessíveis e esteticamente premium.
- **Paleta de Cores:** Focada em tons de cinza e azul (Slate), proporcionando um ambiente de trabalho profissional e livre de distrações.

---

## 🛠 Stack de Engenharia & Performance

- **Framework:** Next.js 15 (App Router)
- **Node.js:** Versão 20+
- **Gestão de Estado:** **TanStack Query (React Query)** para sincronização assíncrona e cache agressivo.
- **Formulários:** **React Hook Form** + **Zod** para validações em tempo real.

### 🚀 Otimização: Standalone Build
Diferente de uma instalação padrão, este frontend foi configurado para **Standalone Build**:
- **O que é:** Durante o processo de build, o Next.js gera uma pasta `.next/standalone` que contém apenas o código estritamente necessário para rodar o servidor.
- **Vantagem:** Reduzimos drasticamente o tamanho da imagem Docker, pois não precisamos levar todas as `node_modules` de desenvolvimento para o container final. O sistema roda diretamente via `node server.js`.

---

## 🧠 Inteligência do Sistema

### Sincronização de Dados (Server State)
Utilizamos o **TanStack Query** para que a interface reflita mudanças no backend quase instantaneamente. Quando você cria uma tarefa ou adiciona um comentário, as listas e os indicadores do dashboard são invalidados e atualizados em background, eliminando a necessidade de "refresh" manual.

### Funcionalidades
- **Dashboard Analítico:** Resumo visual de produtividade com gráficos de volume semanal.
- **Gestão Ágil:** CRUD de tarefas com filtros inteligentes e busca textual.
- **Interação:** Sistema de comentários detalhado para cada atividade.
- **Relatórios:** Central de exportação integrada diretamente com a API.

---

## 🚀 Como rodar localmente

Se você utilizou o `setup.sh` (ou `setup.ps1`) na raiz do projeto, o frontend já está configurado e rodando em modo otimizado.

Caso precise rodar manualmente para desenvolvimento:
1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Inicie em modo dev:**
   ```bash
   npm run dev
   ```

---
Desenvolvido com foco em visual premium e performance técnica.
