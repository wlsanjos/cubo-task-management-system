FROM php:8.3-fpm

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
    libicu-dev

# Limpeza de cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalação de extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl

# Instalação do Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definição do diretório de trabalho
WORKDIR /var/www

# Ajuste de permissões (opcional, dependendo do ambiente)
RUN chown -R www-data:www-data /var/www

EXPOSE 9000
CMD ["php-fpm"]
