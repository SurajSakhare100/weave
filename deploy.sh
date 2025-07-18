#!/bin/bash

# Production Deployment Script for Weave
# This script builds and deploys the application

set -e

echo "🚀 Starting Weave deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "MONGODB_URI"
        "JWT_SECRET"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
        "RAZORPAY_KEY_ID"
        "RAZORPAY_SECRET"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_status "All required environment variables are set"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    cd client
    
    # Install dependencies
    npm ci
    
    # Build the application
    npm run build
    
    cd ..
    print_status "Frontend build completed"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    cd server
    
    # Install dependencies
    npm ci
    
    cd ..
    print_status "Backend build completed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    cd server
    if npm test; then
        print_status "Backend tests passed"
    else
        print_error "Backend tests failed"
        exit 1
    fi
    cd ..
    
    # Frontend tests (if available)
    cd client
    if npm run test; then
        print_status "Frontend tests passed"
    else
        print_warning "Frontend tests failed or not configured"
    fi
    cd ..
}

# Deploy with Docker
deploy_docker() {
    print_status "Deploying with Docker..."
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_status "Docker deployment completed"
}

# Deploy to Vercel (frontend)
deploy_vercel() {
    print_status "Deploying frontend to Vercel..."
    
    cd client
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    cd ..
    print_status "Vercel deployment completed"
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    # Check environment variables
    check_env_vars
    
    # Build applications
    build_frontend
    build_backend
    
    # Run tests
    run_tests
    
    # Choose deployment method
    if [ "$1" = "docker" ]; then
        deploy_docker
    elif [ "$1" = "vercel" ]; then
        deploy_vercel
    else
        print_warning "No deployment method specified. Use 'docker' or 'vercel'"
        print_status "Build completed successfully"
    fi
    
    print_status "Deployment completed successfully! 🎉"
}

# Run main function with arguments
main "$@" 