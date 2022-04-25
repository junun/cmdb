package interfaces

import (
	"cmdb/internal/apps/service"
	"cmdb/internal/middleware"
	"github.com/gin-gonic/gin"
)

func (s *Server) InitRouter() {
	r := s.router
	r.Use(gin.Logger())

	r.Use(gin.Recovery())

	r.GET("/check", HealthCheck)

	//r.LoadHTMLGlob("templates/*")
	//var h *service.AssetHostService
	//_ = s.container.Invoke(func(host *service.AssetHostService) {
	//	h   = host
	//})
	//r.GET("/api/v1/asset/host/ssh/:id", h.ConsoleHost)

	var auth *middleware.TokenAuthMiddlewareService
	_ = s.container.Invoke(func(a *middleware.TokenAuthMiddlewareService) {
		auth   = a
	})
	apiV1 := s.router.Group("/api/v1", auth.TokenAuthMiddleware())
	//apiV1 := s.router.Group("/api/v1")
	s.systemRoutes(apiV1)
	s.assetRoutes(apiV1)
}

func (s *Server) systemRoutes(api *gin.RouterGroup) {
	systemRoute := api.Group("/system")
	{
		var sys *service.SystemService
		_ = s.container.Invoke(func(system *service.SystemService) {
			sys   = system
		})

		systemRoute.GET("", sys.GetSetting)
		systemRoute.POST("", sys.SettingModify)
		systemRoute.GET("/about", sys.About)
		systemRoute.POST("/mail", sys.EmailCheck)
		systemRoute.POST("/ldap", sys.LdapCheck)
		//permRoutes.DELETE("/:id", p.Delete)
	}
	userRoute := api.Group("/user")
	{
		var u *service.UserService
		_ = s.container.Invoke(func(us *service.UserService) {
			u   = us
		})

		var p *service.PermService
		_ = s.container.Invoke(func(perm *service.PermService) {
			p   = perm
		})
		userRoute.POST("/login", u.Login)
		userRoute.POST("/logout", u.Logout)
		userRoute.GET("", u.GetUser)
		userRoute.POST("", u.PostUser)
		userRoute.PUT("/:id", u.PutUser)
		userRoute.GET("/:id", u.GetUserPerm)
		userRoute.DELETE("/:id", u.Delete)
		userRoute.POST("/:id/perm", u.PostUserPerm)
	}
	roleRoute := api.Group("/role")
	{
		var r *service.RoleService
		_ = s.container.Invoke(func(role *service.RoleService) {
			r   = role
		})
		roleRoute.GET("", r.GetRole)
		roleRoute.POST("", r.PostRole)
		roleRoute.PUT("/:id", r.PostRole)
		roleRoute.DELETE("/:id", r.PostRole)
		roleRoute.GET("/:id", r.GetRolePerm)
		roleRoute.POST("/:id/perm", r.PostRolePerm)
	}
	var p *service.PermService
	_ = s.container.Invoke(func(perm *service.PermService) {
		p   = perm
	})
	permRoute := api.Group("/perm")
	{
		permRoute.GET("", p.GetMenuOrPerm)
		permRoute.GET("/:id", p.GetRoleUserMenu)
		permRoute.GET("/all", p.GetAllPerm)
		permRoute.POST("", p.PostPerm)
		permRoute.PUT("/:id", p.PutPerm)
		permRoute.DELETE("/:id", p.DelPerm)
	}
	//permsRoute := api.Group("/perms")
	//{
	//	permsRoute.GET("", p.GetMenuOrPerm)
	//	//permRoutes.DELETE("/:id", p.Delete)
	//}
	menuRoute := api.Group("/menu")
	{
		menuRoute.GET("", p.GetMenuOrPerm)
		menuRoute.POST("", p.PostMenu)
		menuRoute.PUT("/:id", p.PutMenu)
		menuRoute.DELETE("/:id", p.DelMenu)
	}
	subMenuRoute := api.Group("/submenu")
	{
		subMenuRoute.GET("", p.GetMenuOrPerm)
		subMenuRoute.POST("",p.PostSubMenu)
		subMenuRoute.PUT("/:id", p.PutSubMenu)
		subMenuRoute.DELETE("/:id", p.DelMenu)
	}
}

func (s *Server) assetRoutes(api *gin.RouterGroup) {
	dcRoute := api.Group("/asset/dc")
	{
		var i *service.AssetIdcService
		_ = s.container.Invoke(func(idc *service.AssetIdcService) {
			i   = idc
		})

		dcRoute.GET("", i.GetIdc)
		dcRoute.POST("", i.PostIdc)
		dcRoute.PUT("/:id", i.PutIdc)
		dcRoute.DELETE("/:id", i.DelIdc)
	}

	roleRoute := api.Group("/asset/role")
	{
		var r *service.AssetRoleService
		_ = s.container.Invoke(func(role *service.AssetRoleService) {
			r   = role
		})

		roleRoute.GET("", r.GetRole)
		roleRoute.POST("", r.PostRole)
		roleRoute.PUT("/:id", r.PutRole)
		roleRoute.DELETE("/:id", r.DelRole)
	}
	roleDetailRoute := api.Group("/asset/detail")
	{
		var r *service.AssetRoleDetailService
		_ = s.container.Invoke(func(roleDetail *service.AssetRoleDetailService) {
			r   = roleDetail
		})

		roleDetailRoute.GET("", r.GetRoleDetail)
		roleDetailRoute.POST("", r.PostRoleDetail)
		roleDetailRoute.PUT("/:id", r.PutRoleDetail)
		roleDetailRoute.DELETE("/:id", r.DelRoleDetail)
	}

	assetRoute := api.Group("/asset/asset")
	{
		var h *service.AssetAssetService
		_ = s.container.Invoke(func(asset *service.AssetAssetService) {
			h   = asset
		})

		assetRoute.GET("", h.GetAsset)
		assetRoute.POST("", h.PostAsset)
		assetRoute.POST("/import", h.ImportAsset)
		assetRoute.PUT("/:id", h.PutAsset)
		assetRoute.DELETE("/:id", h.DelAsset)
	}
}



// HealthCheck 监控检测
func HealthCheck(ctx *gin.Context) {
	ctx.JSON(200, map[string]interface{}{
		"code":  0,
		"alive": true,
	})
}