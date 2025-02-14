package models

import (
	"time"
)

// Device represents a device associated with a user's session
type Device struct {
	// ID             string    `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()" json:"id"`
	// ID             string    `gorm:"primaryKey; json:"id"`
	ID             string    `json:"id" gorm:"primaryKey"`
	SessionID      string    `gorm:"not null" json:"session_id"`
	IPAddress      string    `json:"ipAddress"`
	UserAgent      string    `json:"userAgent"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"createdAt"`
	LastActivityAt time.Time `gorm:"autoUpdateTime" json:"lastActivityAt"`

	// Relationship to the Session model
	Session Session `gorm:"foreignKey:SessionID;references:ID" json:"session"`
}

// TableName specifies the table name for the Device model
func (Device) TableName() string {
	return "devices"
}
