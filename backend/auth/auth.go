package auth

import (
	"net/http"
	"os"
	"time"

	"example.com/ugonlinemergeserver/initializers"
	"example.com/ugonlinemergeserver/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

func Signup(c *gin.Context) {
	var body struct {
		Name     string
		Email    string
		Password string
	}
	c.BindJSON(&body)

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Failed to hash password."})
		return
	}

	// placeholderImagePath := "public/user-placeholder.png"

	// user := models.BackofficeAccount{FirstName: body.FirstName, Email: body.Email, Password: string(hash)}
	// user := models.BackofficeAccount{Email: body.Email, Password: string(hash)}
	user := models.AgentAdminAccount{Email: body.Email, Password: string(hash)}

	result := initializers.DB.Create(&user)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Failed to create user."})
		return
	}

	c.JSON(200, gin.H{"message": "User created"})
}

// func Login(c *gin.Context) {
// 	//Get the email and password off the request body
// 	var body struct {
// 		Email    string
// 		Password string
// 	}

// 	//Bind the request body to the body struct
// 	if c.Bind(&body) != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email or password."})
// 		return
// 	}

// 	//Look up requested user
// 	var user models.User
// 	initializers.DB.First(&user, "email = ?", body.Email)

// 	if user.ID == 0 {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "User not found."})
// 		return
// 	}

// 	//compare passed in password with saved password
// 	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Failed to hash password"})
// 		return
// 	}

// 	//Generate a JWT token
// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
// 		"sub": user.ID,
// 		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
// 	})

// 	//sign and get the complete encoded token as a string using the secret
// 	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Failed to create token."})
// 		return
// 	}

// 	//return with the user
// 	c.JSON(http.StatusOK, gin.H{"token": tokenString})
// }

// func Login(c *gin.Context) {
// 	var body struct {
// 		Email    string
// 		Password string
// 	}

// 	// if c.BindJSON(&body) != nil {
// 	// 	c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email or password."})
// 	// 	return
// 	// }

// 	if err := c.BindJSON(&body); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email or password.", "error": err.Error()})
// 		return
// 	}

// 	// Look up user by email
// 	var user models.BackofficeAccount
// 	initializers.DB.First(&user, "email = ?", body.Email)

// 	if user.ID == "" {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "User not found."})
// 		return
// 	}

// 	// Compare passwords
// 	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Incorrect password."})
// 		return
// 	}

// 	fmt.Println("Stored password hash:", user.Password)
// 	fmt.Println("Incoming password:", body.Password)

// 	// Generate a JWT token
// 	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
// 		"sub": user.ID,
// 		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
// 	})

// 	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"message": "Failed to create token."})
// 		return
// 	}

//		c.JSON(http.StatusOK, gin.H{"token": tokenString})
//	}
func Login(c *gin.Context) {
	var body struct {
		Email    string
		Password string
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid email or password.", "error": err.Error()})
		return
	}

	// Look up user by email
	// var user models.BackofficeAccount
	var user models.AgentAdminAccount
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found."})
		return
	}

	// Compare passwords
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Incorrect password."})
		return
	}

	// Generate JWT Access Token (valid for 1 hour)
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour).Unix(), // 1 hour expiry
	})

	accessTokenString, err := accessToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create access token."})
		return
	}

	// Generate JWT Refresh Token (valid for 7 days)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days expiry
	})

	refreshTokenString, err := refreshToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to create refresh token."})
		return
	}

	// Return response in required format
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"type":    "auth.TokenResponse",
		"data": gin.H{
			"access_token":  accessTokenString,
			"refresh_token": refreshTokenString,
			"expires_in":    3600, // 1 hour in seconds
			"token_type":    "Bearer",
		},
		"time": time.Now().Unix(),
	})
}

func Validate(c *gin.Context) {
	// fmt.Println("I'm logged in")
	user, _ := c.Get("user")

	// c.JSON(http.StatusOK, gin.H{
	// 	"user": user,
	// })
	c.JSON(http.StatusOK, user)
}

// func GetProfile(c *gin.Context) {
// 	// Extract user ID from middleware
// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
// 		return
// 	}

// 	// Fetch user from DB
// 	var user models.BackofficeAccount
// 	result := initializers.DB.First(&user, "id = ?", userID)
// 	if result.Error != nil {
// 		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
// 		return
// 	}

//		// Return user profile (excluding password)
//		c.JSON(http.StatusOK, gin.H{
//			"data": gin.H{
//				"id":    user.ID,
//				"email": user.Email,
//				"role":  user.Role, // Assuming you have a 'Role' field
//			},
//		})
//	}
func GetProfile(c *gin.Context) {
	// Extract user ID from middleware
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	// Fetch user from DB
	// var user models.BackofficeAccount
	var user models.AgentAdminAccount
	result := initializers.DB.First(&user, "id = ?", userID)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	// Fetch active sessions (assuming you have a `Session` model)
	var sessions []models.Session
	initializers.DB.Where("user_id = ? AND active = ?", userID, true).Find(&sessions)

	// Map sessions and their devices
	sessionData := []gin.H{}
	for _, session := range sessions {
		var devices []models.Device
		initializers.DB.Where("session_id = ?", session.ID).Find(&devices)

		deviceData := []gin.H{}
		for _, device := range devices {
			deviceData = append(deviceData, gin.H{
				"id":             device.ID,
				"sessionID":      device.SessionID,
				"ipAddress":      device.IPAddress,
				"userAgent":      device.UserAgent,
				"createdAt":      device.CreatedAt,
				"lastActivityAt": device.LastActivityAt,
			})
		}

		sessionData = append(sessionData, gin.H{
			"id":        session.ID,
			"active":    session.Active,
			"issuedAt":  session.IssuedAt,
			"expiresAt": session.ExpiresAt,
			"devices":   deviceData,
		})
	}

	// Construct response
	response := gin.H{
		"success": true,
		"type":    "*db.UserInfo",
		"data": gin.H{
			"id": user.ID,
			// "username":  user.Email, // Assuming username is the email
			"phone":     user.Phone,
			"role":      user.Role,
			"firstName": user.FirstName,
			"lastName":  user.LastName,
			// "emailVerified": user.EmailVerified,
			// "activatedAt":   user.ActivatedAt,
			// "phoneVerified": user.PhoneVerified,
			// "createdAt":     user.CreatedAt,
			"email":    user.Email,
			"sessions": sessionData,
		},
		"time": time.Now().Unix(),
	}

	c.JSON(http.StatusOK, response)
}
