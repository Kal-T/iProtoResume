# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy root go.mod and go.sum (for replace directive)
COPY go.mod go.sum* ./

# Copy shared proto files (needed for replace directive)
COPY ./shared ./shared

# Change to service directory
WORKDIR /app/gateway-go

# Copy go mod files
COPY ./gateway-go/go.mod ./gateway-go/go.sum ./

# Set GOTOOLCHAIN to auto to allow Go to download required version
ENV GOTOOLCHAIN=auto

RUN go mod download

# Copy source code
COPY ./gateway-go .

RUN go mod tidy

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o gateway ./cmd/gateway

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/gateway-go/gateway .

EXPOSE 8080

CMD ["./gateway"]
