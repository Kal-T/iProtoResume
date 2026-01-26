package graph

import (
	"github.com/iprotoresume/gateway-go/internal/clients"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	ATSClient    *clients.ValidationClient
	ResumeClient *clients.TailorClient
}
