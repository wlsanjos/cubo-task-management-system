FROM php:8.4-fpm

# Instalação de dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libicu-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libwebp-dev

# Limpeza de cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Configuração e instalação de extensões PHP (otimizadas para Laravel e dompdf)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Instalação do Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definição do diretório de trabalho
WORKDIR /var/www

# Copiar código da aplicação (contexto raiz: copia backend/* para /var/www)
COPY backend/ .

# Copiar .env.docker para criar .env e gerar APP_KEY
COPY backend/.env.docker .env
RUN php artisan key:generate

# Instalação de dependências sem pacotes de desenvolvimento
RUN composer install --no-interaction --no-dev --optimize-autoloader --no-scripts

# Ajuste final de permissões para o usuário do servidor web
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose a porta dinâmica do Railway
EXPOSE $PORT

# Comando padrão para rodar o PHP-FPM
CMD ["php-fpm"]
