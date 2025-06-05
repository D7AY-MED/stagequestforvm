#!/bin/bash

set -e

echo "=== StageQuest Docker Build & Run ==="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker first."
  exit 1
fi

# Make entrypoint script executable
chmod +x docker-entrypoint.sh

# Create nginx directory if it doesn't exist
mkdir -p nginx

# Create nginx config if it doesn't exist
if [ ! -f "./nginx/default.conf" ]; then
  echo "Creating nginx configuration..."
  cp nginx.conf nginx/default.conf
fi

echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "Starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d

echo "Waiting for services to start..."
sleep 5

echo "Checking container status:"
docker-compose -f docker-compose.prod.yml ps

echo "=== StageQuest is now running ==="
echo "- Frontend: http://localhost"
echo "- API: http://localhost:3000/api/health"
echo ""
echo "To view logs, run: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop containers, run: docker-compose -f docker-compose.prod.yml down"
