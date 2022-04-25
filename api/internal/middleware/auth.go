package middleware

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/db"
	"cmdb/internal/infras/utils"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"time"
)

type TokenAuthMiddlewareService struct {
	config  *config.AppConfig
	user 	repo.SystemUserRepository
	perm 	repo.MenuPermRelRepository
	rds 	*redis.Client
}

func NewTokenAuthMiddlewareService(config *config.AppConfig,
	user repo.SystemUserRepository,
	perm repo.MenuPermRelRepository,
	rds *redis.Client) *TokenAuthMiddlewareService {
	return &TokenAuthMiddlewareService{config: config, user: user, perm: perm, rds: rds}
}


func (t *TokenAuthMiddlewareService) TokenAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user  *repo.SystemUser
		// 如果是登录操作请求 不检查Token
		uri := c.Request.URL.String()
		if uri == "/api/v1/user/login" {
			return
		}
		token := c.Request.Header.Get("Authorization")
		if token == "" {
			utils.JsonRespond(401, "API token required！", "", c)
			c.Abort()
			return
		}

		maps := make(map[string]interface{})
		maps["access_token"] = token
		user, err := t.user.GetRow(maps)
		if err != nil || user.TokenExpired < time.Now().Unix() {
			utils.JsonRespond(401, "Invalid API token, please login again！", "", c)
			c.Abort()
			return
		}

		if user.IsActive == 0  {
			utils.JsonRespond(401, "用户已经被禁用，请联系管理员！", "", c)
			c.Abort()
			return
		}

		c.Set("UserIsSupper", user.IsSupper)
		c.Set("UserRid", user.Rid)
		c.Set("Uid", user.ID)
		c.Next()
	}
}

func (t *TokenAuthMiddlewareService) PermissionCheckMiddleware(c *gin.Context, perm string) bool {
	isSupper, _ 	:= c.Get("UserIsSupper")
	// 超级用户不做权限检查
	if isSupper != 1 {
		key 		:= db.RoleRermSetKey
		uid, _ 	:= c.Get("Uid")
		str 		:= fmt.Sprintf("%v", uid)
		redisKey 	:=  key + str

		// 检查 redis 有没有该key的集合
		err := t.rds.Exists(redisKey).Val()
		if err != 1 {
			uid, _ := uid.(int64)
			t.perm.SetRolePermToSet(redisKey, uid)
		}
		// 检查对应的set是否有该用户权限
		isMember, _ := t.rds.SIsMember(key, perm).Result()
		return isMember
	} else {
		return true
	}
}