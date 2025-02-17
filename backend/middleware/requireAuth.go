package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"example.com/ugonlinemergeserver/initializers"
	"example.com/ugonlinemergeserver/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
)

// func RequireAuth(c *gin.Context) {
// 	// Get the Authorization header
// 	authHeader := c.GetHeader("Authorization")
// 	if authHeader == "" {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header is missing"})
// 		c.Abort()
// 		return
// 	}

// 	tokenString := authHeader

// 	// Decode and validate the token
// 	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
// 		// Validate the signing method
// 		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
// 		}
// 		return []byte(os.Getenv("SECRET")), nil
// 	})

// 	if err != nil {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
// 		c.Abort()
// 		return
// 	}

// 	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
// 		// Check the expiration
// 		if float64(time.Now().Unix()) > claims["exp"].(float64) {
// 			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token has expired"})
// 			c.Abort()
// 			return
// 		}

// 		fmt.Println("Received Token:", tokenString)
// 		fmt.Println("Decoded Token Claims:", claims)
// 		fmt.Println("Token Expiry:", claims["exp"])

// 		// Find the user with the token sub
// 		var user models.BackofficeAccount
// 		initializers.DB.First(&user, claims["sub"])

// 		if user.ID == "" {
// 			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
// 			c.Abort()
// 			return
// 		}

// 		// Attach to request
// 		c.Set("userID", user.ID)
// 		c.Set("user", user)
// 		c.Next()
// 	} else {
// 		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
// 		c.Abort()
// 	}
// }

func RequireAuth(c *gin.Context) {
	// Get the Authorization header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization header is missing or invalid"})
		c.Abort()
		return
	}

	// Remove "Bearer " prefix to extract the token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Decode and validate the token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Validate the signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid or expired token"})
		c.Abort()
		return
	}

	// Validate claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Check the expiration
		exp, ok := claims["exp"].(float64)
		if !ok || float64(time.Now().Unix()) > exp {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Token has expired"})
			c.Abort()
			return
		}

		fmt.Println("Received Token:", tokenString)
		fmt.Println("Decoded Token Claims:", claims)
		fmt.Println("Token Expiry:", claims["exp"])

		// Extract and validate user ID from claims
		sub, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
			c.Abort()
			return
		}

		// Find the user with the token `sub`
		// var user models.BackofficeAccount
		var user models.AgentAdminAccount
		result := initializers.DB.First(&user, "id = ?", sub)
		if result.Error != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "User not found"})
			c.Abort()
			return
		}

		// Attach user data to the request context
		// c.Set("userID", user.ID)
		c.Set("userId", user.ID)
		c.Set("user", user)
		c.Next()
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Invalid token claims"})
		c.Abort()
	}
}
