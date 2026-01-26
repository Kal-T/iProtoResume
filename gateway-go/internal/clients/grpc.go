package clients

import (
	"log"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "github.com/iprotoresume/shared/proto"
)

type ValidationClient struct {
	Client     pb.ATSServiceClient
	Connection *grpc.ClientConn
}

type TailorClient struct {
	Client     pb.ResumeServiceClient
	Connection *grpc.ClientConn
}

func NewATSClient() (*ValidationClient, error) {
	addr := os.Getenv("ATS_SERVICE_URL")
	if addr == "" {
		addr = "127.0.0.1:50052"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := pb.NewATSServiceClient(conn)
	log.Printf("Connected to ATS Service at %s", addr)

	return &ValidationClient{
		Client:     client,
		Connection: conn,
	}, nil
}

func NewResumeClient() (*TailorClient, error) {
	addr := os.Getenv("RAG_SERVICE_URL")
	if addr == "" {
		addr = "127.0.0.1:50051"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := pb.NewResumeServiceClient(conn)
	log.Printf("Connected to RAG Service at %s", addr)

	return &TailorClient{
		Client:     client,
		Connection: conn,
	}, nil
}
