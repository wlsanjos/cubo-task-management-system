#!/bin/bash
set -e

# Cores para output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Iniciando o setup 'Production Ready' do Cubo Task System...${NC}"

# 1. Garantir arquivo .env no backend
if [ ! -f backend/.env ]; then
    echo -e "📄 ${YELLOW}Criando .env para o Backend...${NC}"
    cp backend/.env.docker backend/.env
fi

# 2. Subir os containers
echo -e "🐳 ${YELLOW}Subindo os containers (isso pode levar alguns minutos na primeira vez)...${NC}"
docker compose up -d --build

# 3. Aguardar o Banco de Dados estar pronto
echo -e "⏳ ${YELLOW}Aguardando o Banco de Dados (MySQL) estar disponível...${NC}"
until docker compose exec db mysqladmin ping -h "localhost" -u "root" -p"root" --silent; do
    echo -ne "."
    sleep 2
done
echo -e "\n✅ ${GREEN}Banco de Dados está pronto!${NC}"

# 4. Comandos de Setup do Laravel
echo -e "🔑 ${YELLOW}Gerando chave da aplicação...${NC}"
docker compose exec api php artisan key:generate --ansi --force

echo -e "🔗 ${YELLOW}Criando link simbólico para o storage...${NC}"
docker compose exec api php artisan storage:link

echo -e "🗄️ ${YELLOW}Executando migrações...${NC}"
docker compose exec api php artisan migrate --force

echo -e "🌱 ${YELLOW}Populando o banco com dados de teste (Seeders)...${NC}"
docker compose exec api php artisan db:seed --force

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}✅ Sistema instalado com sucesso!${NC}"
echo -e "${CYAN}🌐 Frontend:${NC} http://localhost:3000"
echo -e "${CYAN}🌐 Backend API:${NC} http://localhost:8000"
echo -e "${YELLOW}🔑 Credenciais de Teste:${NC} admin@example.com / password"
echo -e "${GREEN}==================================================${NC}"
