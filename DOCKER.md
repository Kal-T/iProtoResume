# Docker Deployment Guide

This guide covers running iProtoResume using Docker Compose.

## Prerequisites

- Docker Desktop (for Mac M-series)
- Docker Compose (included with Docker Desktop)
- 8GB+ RAM available for Docker

## Quick Start

### 1. Set up environment variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your Google API key:

```env
GOOGLE_API_KEY=your_actual_gemini_api_key_here
```

### 2. Build and run all services

```bash
docker compose up --build
```

This will:
- Build all 4 services (frontend, gateway, ai-service, resume-service)
- Start PostgreSQL and ChromaDB
- Set up networking between services

### 3. Access the application

- **Frontend**: http://localhost:3000
- **GraphQL Playground**: http://localhost:8080/graphql
- **ChromaDB Admin**: http://localhost:8000

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React app (nginx) |
| Gateway | 8080 | GraphQL API |
| AI Service | 50051 | gRPC (internal) |
| Resume Service | 50053 | gRPC (internal) |
| PostgreSQL | 5432 | Database |
| ChromaDB | 8000 | Vector DB |

## Common Commands

### Start services (detached mode)
```bash
docker compose up -d
```

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f gateway
docker compose logs -f ai-service
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (clean slate)
```bash
docker compose down -v
```

### Rebuild specific service
```bash
docker compose up --build frontend
```

### Execute command in running container
```bash
# Access gateway shell
docker compose exec gateway sh

# Run database migrations (if needed)
docker compose exec resume-service ./resume-service migrate
```

## Development Workflow

### Option 1: Full Docker (Production-like)
All services run in containers. Good for testing deployment.

```bash
docker compose up --build
```

### Option 2: Hybrid (Recommended for Development)
Run databases in Docker, services locally for faster iteration.

```bash
# Start only databases
docker compose up postgres chromadb

# Run services locally
cd frontend && npm run dev
cd gateway-go && go run cmd/gateway/main.go
cd ai-service-python && python main.py
cd resume-service-go && go run cmd/server/main.go
```

## Troubleshooting

### Port conflicts
If ports are already in use, stop conflicting services:

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Build failures

**Go services:**
```bash
# Clear Go build cache
docker compose build --no-cache gateway
```

**Python service:**
```bash
# Rebuild with fresh dependencies
docker compose build --no-cache ai-service
```

**Frontend:**
```bash
# Clear npm cache locally first
cd frontend && rm -rf node_modules dist
docker compose build --no-cache frontend
```

### Database connection issues

Ensure PostgreSQL is healthy:
```bash
docker compose ps postgres
```

Reset database (WARNING: deletes all data):
```bash
docker compose down -v
docker compose up postgres -d
```

### Memory issues

Increase Docker Desktop memory allocation:
1. Open Docker Desktop
2. Settings → Resources → Memory
3. Allocate at least 8GB
4. Apply & Restart

## Production Deployment

### Security Checklist
- [ ] Change default PostgreSQL credentials
- [ ] Use environment-specific API keys
- [ ] Enable HTTPS (add reverse proxy like Traefik/Nginx)
- [ ] Set `NODE_ENV=production`
- [ ] Review exposed ports
- [ ] Enable container resource limits

### Environment Variables for Production

Create `.env.production`:

```env
# Database (use managed service in production)
DATABASE_URL=postgresql://user:pass@db.example.com:5432/iprotoresume

# API Keys (from secret manager)
GOOGLE_API_KEY=production_key_here

# Service URLs
AI_SERVICE_URL=ai-service:50051
RESUME_SERVICE_URL=resume-service:50053

# Frontend
VITE_GRAPHQL_URL=https://api.yourdomain.com/graphql
```

Run with production config:
```bash
docker compose --env-file .env.production up -d
```

## Monitoring

### Health Checks

Frontend health:
```bash
curl http://localhost:3000/health
```

Gateway health:
```bash
curl http://localhost:8080/graphql
```

### Resource Usage

```bash
# View container stats
docker stats

# Specific service
docker stats iprotoresume-frontend-1
```

## Data Persistence

Volumes are created for:
- `postgres-data`: PostgreSQL database
- `chroma-data`: ChromaDB vector embeddings

Back up volumes:
```bash
# PostgreSQL
docker compose exec postgres pg_dump -U user iprotoresume > backup.sql

# Restore
docker compose exec -T postgres psql -U user iprotoresume < backup.sql
```

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ :3000
┌──────▼──────────┐         ┌──────────────┐
│   Frontend      │────────►│   Gateway    │
│   (Nginx)       │  :8080  │   (GraphQL)  │
└─────────────────┘         └───┬──────┬───┘
                                │      │
                    ┌───────────┘      └────────────┐
                    │ gRPC                           │ gRPC
            ┌───────▼────────┐            ┌─────────▼────────┐
            │  AI Service    │            │ Resume Service   │
            │  (Python)      │            │  (Go)            │
            └────┬──────────┘             └─────────┬────────┘
                 │                                   │
         ┌───────▼───────┐                  ┌───────▼────────┐
         │   ChromaDB    │                  │   PostgreSQL   │
         └───────────────┘                  └────────────────┘
```

## Next Steps

- Add GitHub Actions for CI/CD
- Set up Docker registry (Docker Hub, AWS ECR, etc.)
- Configure orchestration (Kubernetes, Docker Swarm)
- Add monitoring (Prometheus, Grafana)
- Implement log aggregation (ELK stack)
