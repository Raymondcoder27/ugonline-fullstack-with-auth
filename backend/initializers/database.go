package initializers

import (
	"log"
	"os"

	"example.com/ugonlinemergeserver/models" // Correct import path for your models

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectToDB() {
	var err error

	dsn := os.Getenv("DB") // Using the database URL from the environment variable

	if dsn == "" {
		log.Fatal("Database URL is not set") // Exit if DB URL is missing
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{}) // Connect to PostgreSQL using the DSN
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err) // Log a fatal error if connection fails
	}
}

func MigrateDB() {
	// Migrate the FloatRequest model
	if err := DB.AutoMigrate(&models.TillOperatorFloatRequest{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}
	if err := DB.AutoMigrate(&models.TillOperatorFloatLedger{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.BranchManagerFloatRequest{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.AgentAdminFloatLedger{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.AgentAdminAccount{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}

	// Migrate the schema
	if err := DB.AutoMigrate(&models.Session{}, &models.Device{}); err != nil {
		log.Fatal("Migration failed: ", err)
	}

	if err := DB.AutoMigrate(&models.AdminAgentFloatRequest{}); err != nil {
		log.Printf("Error migrating FloatRequest Database: %v", err)
	}

	// Migrate the ServiceRequest model
	if err := DB.AutoMigrate(&models.CreateServiceRequest{}); err != nil {
		log.Printf("Error migrating ServiceRequest Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.BranchManagerFloatLedger{}); err != nil {
		log.Printf("Error migrating ServiceRequest Database: %v", err)
	}

	// Migrate the Post model
	// if err := DB.AutoMigrate(&models.Post{}); err != nil {
	// 	log.Printf("Error migrating Post Database: %v", err)
	// }

	// Migrate the Post model
	if err := DB.AutoMigrate(&models.Branch{}); err != nil {
		log.Printf("Error migrating Branch Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.Till{}); err != nil {
		log.Printf("Error migrating Till Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.TillOperator{}); err != nil {
		log.Printf("Error migrating Branch Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.AssignTillOperator{}); err != nil {
		log.Printf("Error migrating Till Database: %v", err)
	}

	if err := DB.AutoMigrate(&models.BranchBackofficeAccount{}); err != nil {
		log.Printf("Error migrating branch manager backoffice account Database: %v", err)
	}

	// Migrate the User model
	if err := DB.AutoMigrate(&models.BackofficeAccount{}); err != nil {
		log.Printf("Error migrating User Database: %v", err)
	}

	// Migrate the BranchManager model
	if err := DB.AutoMigrate(&models.BranchManagers{}); err != nil {
		log.Printf("Error migrating BranchManager Database: %v", err)
	}

	// Migrate the Agent model
	if err := DB.AutoMigrate(&models.TillOperator{}); err != nil {
		log.Printf("Error migrating Agent Database: %v", err)
	}

	// Migrate the Transaction model (if applicable to your app)
	if err := DB.AutoMigrate(&models.Transaction{}); err != nil {
		log.Printf("Error migrating Transaction Database: %v", err)
	}
}
