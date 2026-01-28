package clients

import (
	"log"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	pb "github.com/iprotoresume/shared/proto"
)

type AIClient struct {
	Client     pb.AIServiceClient
	Connection *grpc.ClientConn
}

type PersistenceClient struct {
	Client     pb.ResumePersistenceServiceClient
	Connection *grpc.ClientConn
}

func NewAIClient() (*AIClient, error) {
	addr := os.Getenv("AI_SERVICE_URL")
	if addr == "" {
		addr = "127.0.0.1:50051"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := pb.NewAIServiceClient(conn)
	log.Printf("Connected to AI Service at %s", addr)

	return &AIClient{
		Client:     client,
		Connection: conn,
	}, nil
}

func NewPersistenceClient() (*PersistenceClient, error) {
	addr := os.Getenv("RESUME_SERVICE_URL")
	if addr == "" {
		addr = "127.0.0.1:50053"
	}

	conn, err := grpc.Dial(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}

	client := pb.NewResumePersistenceServiceClient(conn)
	log.Printf("Connected to Resume Persistence Service at %s", addr)

	return &PersistenceClient{
		Client:     client,
		Connection: conn,
	}, nil
}
