package main

import (
	"context"
	"log"
	"net"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/iprotoresume/ats-service-go/internal/models"
	pb "github.com/iprotoresume/shared/proto"
	"github.com/lib/pq"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/encoding/protojson"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	defaultPort = "50052"
	dbDSN       = "host=localhost user=user password=password dbname=iprotoresume port=5432 sslmode=disable TimeZone=UTC"
)

type server struct {
	pb.UnimplementedATSServiceServer
	pb.UnimplementedResumePersistenceServiceServer
	DB        *gorm.DB
	RAGClient pb.ResumeServiceClient
}

func (s *server) ValidateResume(ctx context.Context, req *pb.ValidationRequest) (*pb.ATSScore, error) {
	log.Printf("Received Validation Request for: %s", req.Resume.FullName)

	// Call RAG Service for AI Analysis
	ragResp, err := s.RAGClient.AnalyzeResume(ctx, &pb.AnalyzeResumeRequest{
		Resume:         req.Resume,
		JobDescription: req.JobDescription,
	})
	if err != nil {
		log.Printf("Error processing RAG analysis: %v", err)
		return nil, status.Errorf(codes.Internal, "Failed to analyze resume: %v", err)
	}

	return &pb.ATSScore{
		Score:           ragResp.Score,
		MissingKeywords: ragResp.MissingKeywords,
		Feedback:        ragResp.Feedback,
		Reasoning:       ragResp.Reasoning,
	}, nil
}

func (s *server) SaveResume(ctx context.Context, req *pb.SaveResumeRequest) (*pb.SavedResume, error) {
	log.Printf("Saving resume version %s with tags %v", req.Version, req.Tags)

	resumeJson, err := protojson.Marshal(req.Resume)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to marshal resume data: %v", err)
	}

	// Check if a resume with the same version AND tags exists
	var existingResume models.SavedResume
	result := s.DB.Where("version = ? AND tags = ?", req.Version, pq.Array(req.Tags)).First(&existingResume)

	if result.Error == nil {
		// Resume exists - update it
		log.Printf("Updating existing resume with ID %s", existingResume.ID)
		existingResume.ResumeData = resumeJson
		existingResume.UpdatedAt = time.Now()

		if err := s.DB.Save(&existingResume).Error; err != nil {
			return nil, status.Errorf(codes.Internal, "failed to update resume: %v", err)
		}

		return &pb.SavedResume{
			Id:         existingResume.ID.String(),
			ResumeData: req.Resume,
			Tags:       existingResume.Tags,
			Version:    existingResume.Version,
			CreatedAt:  existingResume.CreatedAt.Format(time.RFC3339),
		}, nil
	}

	// Resume doesn't exist - create new
	log.Printf("Creating new resume")
	savedResume := models.SavedResume{
		ResumeData: resumeJson,
		Tags:       req.Tags,
		Version:    req.Version,
	}

	if err := s.DB.Create(&savedResume).Error; err != nil {
		return nil, status.Errorf(codes.Internal, "failed to save to database: %v", err)
	}

	return &pb.SavedResume{
		Id:         savedResume.ID.String(),
		ResumeData: req.Resume,
		Tags:       savedResume.Tags,
		Version:    savedResume.Version,
		CreatedAt:  savedResume.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (s *server) ListResumes(ctx context.Context, req *pb.ListResumesRequest) (*pb.ListResumesResponse, error) {
	var savedResumes []models.SavedResume
	query := s.DB.Model(&models.SavedResume{})

	if len(req.Tags) > 0 {
		// Simple overlap check using Postgres array operator &&
		query = query.Where("tags && ?", pq.Array(req.Tags))
	}

	if err := query.Order("created_at desc").Find(&savedResumes).Error; err != nil {
		return nil, status.Errorf(codes.Internal, "failed to list resumes: %v", err)
	}

	var response []*pb.SavedResume
	for _, r := range savedResumes {
		var resumeData pb.ResumeData
		if err := protojson.Unmarshal(r.ResumeData, &resumeData); err != nil {
			log.Printf("Failed to unmarshal resume data for ID %s: %v", r.ID, err)
			continue
		}

		response = append(response, &pb.SavedResume{
			Id:         r.ID.String(),
			ResumeData: &resumeData,
			Tags:       r.Tags,
			Version:    r.Version,
			CreatedAt:  r.CreatedAt.Format(time.RFC3339),
		})
	}

	return &pb.ListResumesResponse{
		Resumes: response,
	}, nil
}

func (s *server) DeleteResume(ctx context.Context, req *pb.DeleteResumeRequest) (*pb.DeleteResumeResponse, error) {
	// Parse the UUID
	id, err := uuid.Parse(req.Id)
	if err != nil {
		return nil, status.Errorf(codes.InvalidArgument, "invalid resume ID: %v", err)
	}

	// Delete the resume from database
	result := s.DB.Delete(&models.SavedResume{}, "id = ?", id)
	if result.Error != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete resume: %v", result.Error)
	}

	// Check if resume was found and deleted
	if result.RowsAffected == 0 {
		return nil, status.Errorf(codes.NotFound, "resume not found with ID: %s", req.Id)
	}

	return &pb.DeleteResumeResponse{
		Success: true,
	}, nil
}

func main() {
	port := os.Getenv("ATS_SERVICE_PORT")
	if port == "" {
		port = defaultPort
	}

	// Database Connection
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = dbDSN
	}
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Auto Migrate
	if err := db.AutoMigrate(&models.SavedResume{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	// Connect to RAG Service (Python)
	// Default to localhost:50051 if not set
	ragHost := os.Getenv("RAG_SERVICE_HOST")
	if ragHost == "" {
		ragHost = "localhost:50051"
	}
	ragConn, err := grpc.NewClient(ragHost, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("failed to connect to RAG service: %v", err)
	}
	defer ragConn.Close()
	ragClient := pb.NewResumeServiceClient(ragConn)

	s := grpc.NewServer()
	srv := &server{
		DB:        db,
		RAGClient: ragClient,
	}

	pb.RegisterATSServiceServer(s, srv)
	pb.RegisterResumePersistenceServiceServer(s, srv)

	log.Printf("ATS Service (with Persistence) listening on :%s", port)

	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}
