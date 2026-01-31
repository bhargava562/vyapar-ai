
# Market Mania - Development Makefile

.PHONY: help install dev build test clean docker-up docker-down lint format venv

# Default target
help:
	@echo "Market Mania - Available commands:"
	@echo "  install     - Install all dependencies"
	@echo "  venv        - Create Python virtual environment"
	@echo "  dev         - Start development servers"
	@echo "  build       - Build production assets"
	@echo "  test        - Run all tests"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo "  docker-up   - Start Docker services"
	@echo "  docker-down - Stop Docker services"
	@echo "  clean       - Clean build artifacts"

# Create Python virtual environment
venv:
	@echo "Creating Python virtual environment..."
	cd backend && python -m venv venv
	@echo "Virtual environment created. Activate with:"
	@echo "  source backend/venv/bin/activate  (Linux/Mac)"
	@echo "  backend\\venv\\Scripts\\activate     (Windows)"

# Install dependencies
install: venv
	@echo "Installing backend dependencies..."
	cd backend && source venv/bin/activate && pip install -r requirements.txt
	@echo "Installing client dependencies..."
	cd client && npm install

# Development servers
dev:
	@echo "Starting development servers..."
	docker-compose up -d redis
	@echo "Backend: http://localhost:8000"
	@echo "Client: http://localhost:5173"
	@echo "Run 'make dev-backend' and 'make dev-client' in separate terminals"

dev-backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-client:
	cd client && npm run dev

# Build production
build:
	@echo "Building backend..."
	cd backend && source venv/bin/activate && python -m compileall app/
	@echo "Building client..."
	cd client && npm run build

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && source venv/bin/activate && pytest --cov=app --cov-report=term-missing
	@echo "Running client tests..."
	cd client && npm run test

test-backend:
	cd backend && source venv/bin/activate && pytest --cov=app --cov-report=html

test-client:
	cd client && npm run test:coverage

# Property-based tests
test-property:
	@echo "Running property-based tests..."
	cd backend && source venv/bin/activate && pytest -m property
	cd client && npm run test -- --grep "Property"

# Linting
lint:
	@echo "Linting backend..."
	cd backend && source venv/bin/activate && flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
	cd backend && source venv/bin/activate && mypy app --ignore-missing-imports
	@echo "Linting client..."
	cd client && npm run lint

# Code formatting
format:
	@echo "Formatting backend code..."
	cd backend && source venv/bin/activate && black app/
	@echo "Formatting client code..."
	cd client && npm run lint:fix

# Docker operations
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f

docker-build:
	docker-compose build

# Database operations
db-migrate:
	@echo "Run database migrations in Supabase dashboard"
	@echo "SQL file: backend/database_schema.sql"

db-seed:
	@echo "Seeding database with sample data..."
	cd backend && source venv/bin/activate && python scripts/seed_data.py

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/__pycache__
	rm -rf backend/.pytest_cache
	rm -rf backend/htmlcov
	rm -rf backend/logs/*.log
	rm -rf backend/venv
	rm -rf client/dist
	rm -rf client/node_modules/.cache
	rm -rf client/coverage

# Security checks
security:
	@echo "Running security checks..."
	cd backend && source venv/bin/activate && safety check
	cd client && npm audit

# Performance tests
perf:
	@echo "Running performance tests..."
	cd backend && source venv/bin/activate && pytest tests/performance/

# Environment setup
setup-env:
	@echo "Setting up environment files..."
	cp backend/.env.example backend/.env
	cp client/.env.example client/.env
	@echo "Please edit the .env files with your actual configuration"

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	# Add deployment commands here

deploy-prod:
	@echo "Deploying to production..."
	# Add deployment commands here

# Backup
backup:
	@echo "Creating backup..."
	# Add backup commands here

# Monitoring
logs:
	tail -f backend/logs/market_mania.log

monitor:
	@echo "Opening monitoring dashboard..."
	@echo "Grafana: http://localhost:3001"
	@echo "Prometheus: http://localhost:9090"