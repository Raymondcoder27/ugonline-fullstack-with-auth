package models

import (
	"time"
)

// Session represents an active session for a user
type Session struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	UserID    string    `gorm:"not null" json:"user_id"`
	Active    bool      `gorm:"default:true" json:"active"`
	IssuedAt  time.Time `gorm:"autoCreateTime" json:"issuedAt"`
	ExpiresAt time.Time `json:"expiresAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`

	// Relationship with Device model (One-to-many)
	Devices []Device `gorm:"foreignKey:SessionID;references:ID" json:"devices"`
}

// TableName specifies the table name for the Session model
func (Session) TableName() string {
	return "sessions"
}
