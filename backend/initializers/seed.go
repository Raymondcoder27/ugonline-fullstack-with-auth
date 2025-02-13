package initializers

import (
	"fmt"
	"log"

	"example.com/ugonlinemergeserver/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func SeedAdminUser() {
	email := "admin@example.com"
	password := "Admin@123" // This is the raw password

	var user models.BackofficeAccount
	result := DB.First(&user, "email = ?", email)

	if result.RowsAffected == 0 { // User does not exist, so create it
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password: %v", err)
		}

		user = models.BackofficeAccount{
			ID:       uuid.New().String(), // Ensure UUID is set
			Email:    email,
			Password: string(hashedPassword),
		}

		if err := DB.Create(&user).Error; err != nil {
			log.Fatalf("Failed to seed admin user: %v", err)
		} else {
			fmt.Println("Seeded admin user successfully!")
		}
	} else {
		fmt.Println("Admin user already exists.")
	}
}
