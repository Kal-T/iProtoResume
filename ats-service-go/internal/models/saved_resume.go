package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"gorm.io/gorm"
)

// SavedResume represents the DB schema for a saved resume
type SavedResume struct {
	ID         uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ResumeData []byte         `gorm:"type:jsonb"` // Store as JSON blob for flexibility
	Tags       pq.StringArray `gorm:"type:text[]"`
	Version    string
	CreatedAt  time.Time
	UpdatedAt  time.Time
	DeletedAt  gorm.DeletedAt `gorm:"index"`
}
