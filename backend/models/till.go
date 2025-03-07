package models

// TillOperator represents a user managing float at specific tills.
type Till struct {
	ID   string `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique;not null"` // e.g., "Till 1"
}
