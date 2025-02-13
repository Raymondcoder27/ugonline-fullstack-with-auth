package main

import (
	"example.com/ugonlinemergeserver/auth"
	"example.com/ugonlinemergeserver/controllers"
	"example.com/ugonlinemergeserver/initializers"
	"example.com/ugonlinemergeserver/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDB()
	initializers.MigrateDB()
	initializers.InitMinioClient()
	initializers.SeedAdminUser() // Seed the admin user
}

func main() {
	r := gin.Default()

	// Set up CORS middleware
	config := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}
	r.Use(cors.New(config))

	r.POST("/register", auth.Signup)
	r.POST("/auth/login", auth.Login)
	r.GET("/validate", middleware.RequireAuth, auth.Validate)

	// Define route groups for the 3 dashboards
	// Auth group for protected routes
	// authGroup := r.Group("/")
	authGroup := r.Group("/", middleware.RequireAuth)
	// abc@1234
	{
		// Till Operator Dashboard
		tillOperator := authGroup.Group("/till-operator")
		{
			tillOperator.POST("/request-float", controllers.TillOperatorRequestFloat)
			tillOperator.POST("/service-request", controllers.TillOperatorServiceRequest)
			tillOperator.GET("/float-requests", controllers.GetTillOperatorFloatRequests)
			tillOperator.GET("/float-ledgers", controllers.GetTillOperatorFloatLedger)
			tillOperator.PUT("/float-requests/:requestId", controllers.UpdateTillOperatorFloatRequest)
			tillOperator.PUT("/float-ledgers/:requestId", controllers.UpdateTillOperatorFloatLedger)
			// Add more Till Operator-specific routes here as needed
			//{{host}}/till-operator2-float-ledgers
			// tillOperator.GET("/float-requests/:refNumber", controllers.GetTillOperatorFloatRequest)
			// tillOperator.GET("/float-ledgers", controllers.GetTillOperatorFloatLedgers)
			tillOperator.POST("/add-float-ledger-record", controllers.AddTillOperatorFloatLeger)
			// tillOperator.GET("/service-requests", controllers.GetTillOperatorServiceRequests)
			// tillOperator.GET("/service-requests/:refNumber", controllers.GetTillOperatorServiceRequest)
			// //get till operator float ledgers
			// tillOperator.GET("/float-ledgers/:refNumber", controllers.GetTillOperatorFloatLedger)
			// tillOperator.GET("/float-ledgers", controllers.GetTillOperatorFloatLedgers)
			// tillOperator.PUT("/float-ledgers/:refNumber", controllers.UpdateTillOperatorFloatLedger)
		}

		// Branch Manager Dashboard
		branchManager := authGroup.Group("/branch-manager")
		{
			branchManager.POST("/request-float", controllers.BranchManagerRequestFloat)
			branchManager.POST("/add-till", controllers.AddTill)
			branchManager.GET("/tills", controllers.GetTills)
			branchManager.POST("/assign-till-operator", controllers.AssignTillOperator)
			branchManager.POST("/add-float-ledger-record", controllers.AddBranchManagerFloatLedger)
			// branchManager.POST("/approve-float-request", controllers.BranchManagerApproveFloatRequest)
			branchManager.PUT("/update-float-request/:id", controllers.BranchManagerUpdateFloatRequest)
			// branchManager.PUT("/approve-float-request/{id}", controllers.BranchManagerApproveFloatRequest)
			branchManager.PUT("/update-float-ledger/:id", controllers.BranchManagerUpdateFloatLedger)
			branchManager.GET("/float-requests", controllers.GetBranchManagerFloatRequests)
			// branchManager.GET("/float-requests", controllers.GetTillOperatorFloatRequests)
			branchManager.GET("/float-requests/:refNumber", controllers.GetBranchManagerFloatRequest)
			branchManager.GET("/float-ledgers", controllers.GetBranchManagerFloatLedger)
			branchManager.GET("/till-operator-accounts", controllers.GetTillOperatorAccounts)
			branchManager.POST("/create-till-operator-account", controllers.CreateTillOperatorAccount)
			branchManager.GET("/back-office-accounts", controllers.GetBranchBackOfficeAccounts)
			branchManager.POST("/create-back-office-account", controllers.CreateBranchBackOfficeAccount)
			branchManager.DELETE("/close-till/:id", controllers.CloseTill)
			// branchManager.GET("/float-ledgers/:refNumber", controllers.GetBranchManagerFloatLedger)
			// branchManager.PUT("/float-ledgers/:refNumber", controllers.UpdateBranchManagerFloatLedger)
			// branchManager.GET("/service-requests", controllers.GetBranchManagerServiceRequests)
			// branchManager.GET("/service-requests/:refNumber", controllers.GetBranchManagerServiceRequest)
			// branchManager.DELETE("/till/:refNumber", controllers.DeleteTill)
		}

		// Agent Admin Dashboard
		agentAdmin := authGroup.Group("/agent-admin")
		{
			agentAdmin.GET("/services", controllers.GetAgentAdminFloatRequests)
			agentAdmin.POST("/create-branch", controllers.CreateBranch)
			agentAdmin.GET("/back-office-accounts", controllers.GetBackOfficeAccounts)
			agentAdmin.POST("/assign-branch-manager", controllers.AllocateBranchManager)
			agentAdmin.POST("/create-branch-manager-account", controllers.CreateBranchManagerAccount)
			agentAdmin.POST("/create-back-office-account", controllers.CreateBackOfficeAccount)
			agentAdmin.POST("/add-float-ledger-record", controllers.AddAgentAdminFloatLedger)
			agentAdmin.GET("/float-requests", controllers.GetAgentAdminFloatRequests)
			agentAdmin.GET("/float-ledgers", controllers.GetAgentAdminFloatLedger)
			agentAdmin.GET("/float-requests/:refNumber", controllers.GetAgentAdminFloatRequest)
			agentAdmin.GET("/branches", controllers.GetBranches)
			agentAdmin.GET("/branch-manager-accounts", controllers.GetBranchManagerAccounts)
			agentAdmin.PUT("/update-float-request/:id", controllers.AgentAdminUpdateFloatRequest)
			agentAdmin.PUT("/update-float-ledger/:id", controllers.AgentAdminUpdateFloatLedger)
			agentAdmin.DELETE("/close-branch/:id", controllers.CloseBranch)
		}
	}

	// Start the server
	r.Run(":8000") // You can customize the port as needed
}
