#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null
then
    echo "Docker Compose could not be found. Please install Docker Compose first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    # Generate a random JWT secret
    SECRET=$(openssl rand -base64 32)
    # Use sed to replace the placeholder (cross-platform compatible sed is tricky, aiming for Linux/GNU sed here)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/super-secret-key-change-this/$SECRET/g" .env
    else
        sed -i "s/super-secret-key-change-this/$SECRET/g" .env
    fi
    echo "Generated random JWT_SECRET."
fi

echo "Building and starting containers..."
docker-compose up -d --build

echo "Deployment complete! Access the panel at http://localhost (or your server IP)"
