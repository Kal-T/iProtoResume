# iProtoResume 🚀

[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**iProtoResume** is a production-grade, AI-powered Resume Builder built with a Microservices architecture. It leverages **Google Gemini** and **RAG (Retrieval-Augmented Generation)** to tailor resumes to specific job descriptions and features a dedicated **AI ATS Scoring Engine** to ensure high visibility.

---

## ✨ Key Features

- **🤖 AI Resume Tailoring**: Instantly adapts your resume to match job descriptions using semantic analysis (Gemini 1.5 Flash).
- **📝 Smart Cover Letters**: Generates professional, editable cover letters tailored to the role.
- **📊 AI ATS Scoring**: Advanced semantic scoring with detailed reasoning, feedback, and keyword gap analysis.
- **👁️ Interactive Preview**: Real-time "Diff" view showing exactly what the AI changed.
- **📄 PDF Export**: Download tailored resumes and cover letters in professional formats.
- **🏗️ Microservices**: Scalable architecture using Go (Gateway/ATS) and Python (AI/RAG) connected via gRPC.

---

## 🏗 Architecture

The system is built on a "Contract-First" design using Protocol Buffers (gRPC) for high-performance inter-service communication.

```mermaid
graph TD
    User((User))
    FE["Frontend (React/Tailwind)"]
    GW["Gateway (Go/GraphQL)"]
    RAG["RAG Service (Python/gRPC)"]
    ATS["ATS Service (Go/gRPC)"]
    DB[(PostgreSQL)]
    VecDB[(ChromaDB)]

    User -->|HTTP| FE
    FE -->|GraphQL| GW
    GW -->|gRPC| RAG
    GW -->|gRPC| ATS
    RAG -->|Vector Search| VecDB
    ATS -->|Scoring Logic| ATS
    GW -->|SQL| DB
```

## 🛠 Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React, TailwindCSS, Vite | Responsive, modern UI/UX with real-time previews. |
| **Gateway** | Go, gqlgen | GraphQL entry point, request orchestration. |
| **RAG Service** | Python, gRPC, Gemini, ChromaDB | AI logic for tailoring, cover letters, and semantic search. |
| **ATS Service** | Go, gRPC | Orchestrates scoring and analysis. |
| **Data** | PostgreSQL, ChromaDB | User data & Vector embeddings. |
| **Infra** | Docker Compose | Optimized for local dev (Apple Silicon/M-series support). |

---

## 🚀 Getting Started

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Optional, for containerized run)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kal-T/iProtoResume.git
   cd iProtoResume
   ```

2. **Environment Setup:**
   Copy the example environment file and configure your API keys.
   ```bash
   cp .env.example .env
   # CRITICAL: Edit .env and add your GOOGLE_API_KEY (Gemini)
   ```

3. **Generate Protocol Buffers:**
   We use a helper Makefile to generate Go and Python code from `.proto` files.
   ```bash
   make proto
   ```

4. **Start the Stack:**
   
   **Option A: Local Development (Recommended)**
   ```bash
   # Terminal 1: Frontend
   cd frontend && npm install && npm run dev
   
   # Terminal 2: Gateway
   go run cmd/gateway/main.go
   
   # Terminal 3: ATS Service
   go run cmd/server/main.go
   
   # Terminal 4: RAG Service
   python3 rag-service-python/main.py
   ```

   **Option B: Docker Compose**
   ```bash
   docker-compose up --build
   ```

   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Gateway Playground:** [http://localhost:8080](http://localhost:8080)

---

## 📂 Project Structure

```bash
├── frontend/               # React + Tailwind application
├── gateway-go/            # Go GraphQL Gateway
│   ├── cmd/               # Entry points
│   └── internal/          # Business logic & resolvers
├── rag-service-python/    # Python AI Service (Gemini + ChromaDB)
├── ats-service-go/        # Go ATS Service
├── shared/
│   └── proto/             # Protocol Buffer Definitions (.proto)
├── tests/                 # E2E and Integration tests
└── docker-compose.yml     # Infrastructure config
```

## 🧪 Testing

Run integration tests using our Makefile helper:

```bash
make test-integration
```

Or run unit tests for specific services:

```bash
cd gateway-go && go test ./...
cd rag-service-python && pytest
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
