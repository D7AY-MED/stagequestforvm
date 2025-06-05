#!/bin/bash
# Simple script to build the frontend

# Make sure Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
npm install

# Build the frontend
npm run build

echo "Frontend build completed. You can now run docker-compose up"
