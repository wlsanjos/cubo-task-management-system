#!/bin/bash

# 1. Garantir que este script e outros essenciais tenham permissão de execução
# Se estiver no Linux/WSL, você pode rodar: chmod +x setup.sh && ./setup.sh

# 2. Garantir arquivo .env no backend
if [ ! -f backend/.env ]; then
    echo "📄 Criando .env para o Backend a partir do .env.docker..."
    cp backend/.env.docker backend/.env
fi

# 3. Subir os containers
# Agora o Docker aguarda o banco estar "healthy" automaticamente
docker-compose up -d --build

echo "📦 Instalando dependências do Backend..."
docker-compose exec api composer install

echo "🔐 Ajustando permissões de storage e cache (Urgente)..."
docker-compose exec api chmod -R 777 storage bootstrap/cache

echo "🔑 Gerando chave de aplicação Laravel..."
docker-compose exec api php artisan key:generate --ansi

echo "🗄️ Executando migrações do Banco de Dados..."
docker-compose exec api php artisan migrate --force

echo "🎨 Instalando dependências do Frontend..."
docker-compose exec frontend npm install

echo "✅ Setup concluído!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
