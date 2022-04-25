package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/unknwon/com"
)

func GetPage(c *gin.Context, pageSize int) int {
	result 	:= 0
	page, _ := com.StrTo(c.Query("page")).Int()
	if page > 0 {
		result = (page - 1) * pageSize
	}

	return result
}

func GetPageSize(c *gin.Context, defaultPageSize int) int {
	result,_ := com.StrTo(c.Query("pageSize")).Int()
	if result == 0 {
		return defaultPageSize
	}
	return result
}