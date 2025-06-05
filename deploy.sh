#!/bin/bash

echo "===== StageQuest Deployment Script ====="
echo "Building frontend application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
  echo "✅ Build completed successfully!"
  echo "Starting Docker containers..."
  docker-compose down
  docker-compose up -d --build
  
  echo ""
  echo "🚀 Deployment complete!"
  echo "Access your application at http://localhost"
else
  echo "❌ Build failed. Please check for errors and try again."
  exit 1
fi
