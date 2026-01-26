package clients

import (
	"log"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	"github.com/iprotoresume/shared/proto/ats"
	"github.com/iprotoresume/shared/proto/resume"
)

type ValidationClient struct {
	Client     ats.ATSServiceClient
	Connection *grpc.ClientConn
}

type TailorClient struct {
	Client     resume.ResumeServiceClient
	Connection *grpc.ClientConn
}

func NewATSClient() (*ValidationClient, error) {
	addr := os.Getenv("ATS_SERVICE_URL")
	if addr == "" {
		addr = "localhost:50052"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := ats.NewATSServiceClient(conn)
	log.Printf("Connected to ATS Service at %s", addr)

	return &ValidationClient{
		Client:     client,
		Connection: conn,
	}, nil
}

func NewResumeClient() (*TailorClient, error) {
	addr := os.Getenv("RAG_SERVICE_URL")
	if addr == "" {
		addr = "localhost:50051"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := resume.NewResumeServiceClient(conn)
	log.Printf("Connected to RAG Service at %s", addr)

	return &TailorClient{
		Client:     client,
		Connection: conn,
	}, nil
}
