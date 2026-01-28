`.PHONY: proto proto-go proto-py init-go test-integration run stop clean

# Local Protobuf Generation
proto:
	@echo "Generating Go and Python code from protos..."
	# Go
	protoc --proto_path=. --go_out=. --go_opt=paths=source_relative \
		--go-grpc_out=. --go-grpc_opt=paths=source_relative \
		shared/proto/resume.proto shared/proto/ats.proto
	# Python (using venv) - SKIPPED DUE TO ENV ISSUE
	# . ai-service-python/venv_ai/bin/activate && \
	# python3 -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. \
	# 	shared/proto/resume.proto shared/proto/ats.proto

# Initialize Go Modules (Local)
init-go:
	@echo "Initializing Gateway Go Module..."
	cd gateway-go && go mod init github.com/iprotoresume/gateway-go || true
	@echo "Initializing Resume Service Go Module..."
	cd resume-service-go && go mod init github.com/iprotoresume/resume-service-go || true
	@echo "Initializing Shared Proto Module..."
	go mod init github.com/iprotoresume || true

# Setup Python Venv
setup-python:
	cd ai-service-python && python3 -m venv venv_ai && \
	. venv_ai/bin/activate && \
	pip install grpcio grpcio-tools chromadb fastapi uvicorn

# Infrastructure
run:
	docker-compose up --build -d

stop:
	docker-compose down

# Testing
test-integration:
	@echo "Running integration tests..."
	# Placeholder
	
clean:
	rm -f shared/proto/*.pb.go shared/proto/*.pb.py shared/proto/*_pb2.py shared/proto/*_pb2_grpc.py
