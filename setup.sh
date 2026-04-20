#!/bin/bash

# 1. Garantir arquivo .env no backend
if [ ! -f backend/.env ]; then
    echo "📄 Criando .env para o Backend a partir do .env.docker..."
    cp backend/.env.docker backend/.env
fi

# 2. Subir os containers
docker-compose up -d --build

echo "📦 Instalando dependências do Backend..."
docker-compose exec api composer install

echo "🔐 Ajustando permissões de storage e cache..."
docker-compose exec api chown -R www-data:www-data storage bootstrap/cache
docker-compose exec api chmod -R 775 storage bootstrap/cache

echo "🔑 Gerando chave de aplicação Laravel..."
docker-compose exec api php artisan key:generate --ansi

echo "🗄️ Executando migrações do Banco de Dados..."
# Aguarda um pouco o MySQL estabilizar
sleep 5
docker-compose exec api php artisan migrate --force

echo "🎨 Instalando dependências do Frontend..."
docker-compose exec frontend npm install

echo "✅ Setup concluído!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
