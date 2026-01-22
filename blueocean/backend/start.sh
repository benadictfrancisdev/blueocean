#!/bin/bash

# DataForge AI Backend Startup Script

echo "Starting DataForge AI Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Start services with docker-compose
echo "Starting Docker services..."
docker-compose up -d

echo ""
echo "✓ Services started successfully!"
echo ""
echo "API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "PostgreSQL: localhost:5432"
echo "Redis: localhost:6379"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop services:"
echo "  docker-compose down"
