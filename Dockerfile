# Base image for PHP and Apache
FROM php:7.4-apache

# Install Python and other necessary packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    supervisor \
    build-essential \
    libffi-dev \
    libssl-dev \
    libjpeg62-turbo-dev \
    zlib1g-dev \
    wget \
    libonig-dev \
    libzip-dev \
    zip \
    unzip \
    gcc \
    g++ \
    libc-dev \
    make \
    libgtk-3-0 \
    libnss3 \
    libxcomposite1 \
    libxrandr2 \
    libgbm1 \
    libxdamage1 \
    libasound2 \
    libxshmfence1 \
    libatk-bridge2.0-0 \
    libxcb-dri3-0 \
    libx11-xcb1 \
    libxi6 \
    libxcursor1 \
    && docker-php-ext-install mbstring zip exif pcntl bcmath mysqli \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy application files
COPY . /app

# Install Python dependencies
COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# Install debugpy and Playwright for image processing
RUN pip3 install debugpy==1.6.4 playwright \
    && PLAYWRIGHT_BROWSERS_PATH=/ms-playwright playwright install chromium

# Apache configuration for web GUI
RUN rm -rf /var/www/html && ln -s /app/web /var/www/html

# Set permissions for /app directory
RUN chmod -R 777 /app/api/templates

# Expose ports for both services
EXPOSE 80 8000

RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf


# Copy both supervisor configuration files
COPY supervisord_imageapi.conf /etc/supervisor/conf.d/supervisord_imageapi.conf
COPY supervisord_webgui.conf /etc/supervisor/conf.d/supervisord_webgui.conf

# Set the entrypoint script to select the correct supervisor config
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set entrypoint to the script
ENTRYPOINT ["/entrypoint.sh"]


