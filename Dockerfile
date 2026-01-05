FROM php:8.2-apache

RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN a2enmod rewrite
RUN sed -ri "s/AllowOverride None/AllowOverride All/g" /etc/apache2/apache2.conf
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html
COPY . /var/www/html

EXPOSE 80