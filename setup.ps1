Write-Host "--- 🚀 Iniciando o setup 'Production Ready' do Cubo Task System ---" -ForegroundColor Cyan

# 1. Garantir arquivo .env no backend
if (-not (Test-Path "backend\.env")) {
    Write-Host "📄 Criando .env para o Backend..." -ForegroundColor Gray
    Copy-Item "backend\.env.docker" "backend\.env"
}

# 2. Subir os containers
Write-Host "🐳 Subindo os containers (isso pode levar alguns minutos na primeira vez)..." -ForegroundColor Yellow
docker compose up -d --build

# 3. Aguardar o Banco de Dados estar pronto
Write-Host "⏳ Aguardando o Banco de Dados (MySQL) estar disponível..." -ForegroundColor Yellow
$dbReady = $false
while (-not $dbReady) {
    $status = docker compose exec db mysqladmin ping -h "localhost" -u "root" -p"root" --silent
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
    } else {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}
Write-Host "`n✅ Banco de Dados está pronto!" -ForegroundColor Green

# 4. Comandos de Setup do Laravel
Write-Host "🔑 Gerando chave da aplicação..." -ForegroundColor Yellow
docker compose exec api php artisan key:generate --ansi --force

Write-Host "🔗 Criando link simbólico para o storage..." -ForegroundColor Yellow
docker compose exec api php artisan storage:link

Write-Host "🗄️ Executando migrações..." -ForegroundColor Yellow
docker compose exec api php artisan migrate --force

Write-Host "🌱 Populando o banco com dados de teste (Seeders)..." -ForegroundColor Yellow
docker compose exec api php artisan db:seed --force

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "✅ Sistema instalado com sucesso!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🔑 Credenciais de Teste: admin@example.com / password" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Green
