package interfaces

import (
	"cmdb/internal/apps/service"
	"cmdb/internal/config"
	"cmdb/internal/infras/persistence"
	"cmdb/internal/middleware"
	"go.uber.org/dig"
)

var container = dig.New()

func BuildContainer() *dig.Container {
	// config
	container.Provide(config.LoadConfig)
	//
	//// init
	container.Provide(config.InitAppConf)
	//
	//// DB
	container.Provide(config.InitDBConf)
	// redis
	container.Provide(config.InitRedisConn)

	//container.Provide(persistence.NewPermissionsRelRepository)
	container.Provide(persistence.NewUserPermRelRepository)
	container.Provide(persistence.NewUserRepository)
	container.Provide(service.NewUserService)

	container.Provide(persistence.NewSettingRepository)

	container.Provide(middleware.NewTokenAuthMiddlewareService)

	container.Provide(persistence.NewMenuPermRelRepository)
	container.Provide(service.NewPermService)
	container.Provide(service.NewSystemService)

	container.Provide(persistence.NewRoleRepository)
	container.Provide(persistence.NewRolePermRelRepository)
	container.Provide(service.NewRoleService)

	container.Provide(persistence.NewAssetIdcRepository)
	container.Provide(service.NewAssetIdcService)

	container.Provide(persistence.NewAssetRoleRepository)
	container.Provide(service.NewAssetRoleService)

	container.Provide(persistence.NewAssetRoleDetailRepository)
	container.Provide(service.NewAssetRoleDetailService)

	container.Provide(persistence.NewAssetAssetRepository)
	container.Provide(service.NewAssetAssetService)

	container.Provide(NewServer)

	return container
}

func Invoke(i interface{}) error {
	return container.Invoke(i)
}