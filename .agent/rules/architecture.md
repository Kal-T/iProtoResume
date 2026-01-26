---
trigger: always_on
---

# Microservices & Tech Stack Rules
Follow these standards for every task in iProtoResume.

## 1. The Tech Stack Contract
- **Gateway (Go):** Use `cmd/` for entry points and `internal/` for logic. Use `gqlgen` for GraphQL.
- **RAG Service (Python):** Use `FastAPI` for health checks and `grpcio` for the main logic.
- **ATS Service (Go):** Focus on regex and string parsing efficiency.
- **Shared:** All `.proto` files must live in `/shared/proto`.

## 2. Communication Policy
- **External:** ONLY GraphQL for Frontend-to-Gateway.
- **Internal:** ONLY gRPC for Service-to-Service communication.
- **Safety:** Always close gRPC connections and use `context` for timeouts in Go.

## 3. Environment Safety
- Never hardcode secrets. Always check for a `.env` file or prompt the user.