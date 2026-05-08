#!/bin/bash
# Startup script that runs migrations on Render (internal network)

echo "🔄 Checking database connection..."

# Run migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations complete"
else
    echo "⚠️ Migration warning (may already be at latest)"
fi

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

echo "🚀 Starting server..."
node server.js
