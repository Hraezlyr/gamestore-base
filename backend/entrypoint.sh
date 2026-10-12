#!/bin/sh

echo "Esperando que PostgreSQL esté disponible..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.5
done
echo "PostgreSQL listo."

python manage.py migrate --noinput

exec "$@"