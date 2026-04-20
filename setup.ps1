Write-Host "--- Iniciando setup do ambiente Cubo ---" -ForegroundColor Cyan

# 1. Garantir arquivo .env no backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "Criando .env para o Backend a partir do .env.docker..." -ForegroundColor Gray
    Copy-Item "backend\.env.docker" "backend\.env"
}

# 2. Subir os containers
# O Docker Compose ja aguarda o banco estar saudavel
docker-compose up -d --build

Write-Host "Instalando dependencias do Backend (Composer)..." -ForegroundColor Yellow
docker-compose exec api composer install

Write-Host "Ajustando permissoes de storage e cache (Urgente)..." -ForegroundColor Yellow
docker-compose exec api chmod -R 777 storage bootstrap/cache

Write-Host "Gerando chave de aplicacao Laravel..." -ForegroundColor Yellow
docker-compose exec api php artisan key:generate --ansi

Write-Host "Executando migracoes do Banco de Dados..." -ForegroundColor Yellow
docker-compose exec api php artisan migrate --force

Write-Host "Instalando dependencias do Frontend (NPM)..." -ForegroundColor Yellow
docker-compose exec frontend npm install

Write-Host "--- Setup concluido! ---" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend API: http://localhost:8000"
