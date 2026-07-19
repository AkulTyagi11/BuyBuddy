FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps: build-essential + libpq for psycopg2 (PostgreSQL).
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Migrate, seed default categories, collect static, then serve the ASGI app
# (HTTP + WebSockets) with Daphne.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py seed_categories && python manage.py collectstatic --noinput && daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]
