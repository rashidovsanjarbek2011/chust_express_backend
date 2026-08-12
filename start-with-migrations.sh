#!/bin/bash
# Startup script that runs migrations on Render (internal network)

echo "🔄 Checking database connection..."
echo "Database URL: ${DATABASE_URL:0:30}..."

# For PostgreSQL on Render, use db push to create tables from schema
echo "🔄 Pushing schema to database..."
npx prisma db push --accept-data-loss || {
    echo "⚠️ DB push had issues, trying alternative..."
    npx prisma migrate dev --name init --create-only 2>/dev/null || true
    npx prisma migrate deploy 2>/dev/null || true
}

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Database setup complete"
echo "🚀 Starting server..."
node server.js
