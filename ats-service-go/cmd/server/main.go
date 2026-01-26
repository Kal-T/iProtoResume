package main

import (
	"context"
	"log"
	"net"
	"os"
	"strings"

	"github.com/iprotoresume/ats-service-go/internal/scorer"
	pb "github.com/iprotoresume/shared/proto"
	"google.golang.org/grpc"
)

type server struct {
	pb.UnimplementedATSServiceServer
}

func (s *server) ValidateResume(ctx context.Context, req *pb.ValidationRequest) (*pb.ATSScore, error) {
	log.Printf("Received Validation Request for: %s", req.Resume.FullName)

	// Combine resume fields into a single text blob for analysis
	var resumeTextBuilder strings.Builder
	resumeTextBuilder.WriteString(req.Resume.Summary + " ")
	for _, exp := range req.Resume.Experience {
		resumeTextBuilder.WriteString(exp.Title + " " + exp.Description + " ")
	}
	for _, skill := range req.Resume.Skills {
		resumeTextBuilder.WriteString(skill + " ")
	}

	// Perform Analysis
	result := scorer.Calculate(resumeTextBuilder.String(), req.JobDescription)

	return &pb.ATSScore{
		Score:           result.Score,
		MissingKeywords: result.MissingKeywords,
		Feedback:        result.Feedback,
	}, nil
}

func main() {
	port := os.Getenv("ATS_SERVICE_PORT")
	if port == "" {
		port = "50052"
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterATSServiceServer(s, &server{})
	log.Printf("ATS Service listening on :%s", port)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
