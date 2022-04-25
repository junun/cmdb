package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"github.com/gin-gonic/gin"
	"strings"
)


type AssetRoleResource struct {
	Name    	string    	`form:"name"`
	Desc 		string    	`form:"desc"`
}

type AssetRoleService struct {
	config  *config.AppConfig
	role 	repo.AssetRoleRepository
	detail  repo.AssetRoleDetailRepository
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewAssetRoleService(config *config.AppConfig,
	role repo.AssetRoleRepository,
	detail repo.AssetRoleDetailRepository,
	auth *middleware.TokenAuthMiddlewareService) *AssetRoleService {
	return &AssetRoleService{config: config, role: role, detail: detail, auth: auth}
}

func (a *AssetRoleService) GetRole(c *gin.Context)  {
	var count int
	maps := make(map[string]interface{})
	data := make(map[string]interface{})
	name := c.Query("name")
	if name != "" {
		maps["name"] = name
	}
	users, err 	:= a.role.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	count = len(users)
	data["list"] = users
	data["count"] = count
	utils.JsonRespond(200, "", data, c)
	return
}

func (a *AssetRoleService) PostRole(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.role.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetRoleResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res,_ := a.role.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "重复的资产类型名，请检查！", "", c)
		return
	}
	newRole := repo.AssetRole {
		Name: name,
		Desc: data.Desc}
	err = a.role.Store(&newRole)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "添加资产类型成功", "", c)
}

func (a *AssetRoleService) PutRole(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.role.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetRoleResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps 	:= make(map[string]interface{})
	id64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	idc,err := a.role.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := a.role.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "资产类型名重复！", "", c)
		return
	}

	if idc.Name != name || idc.Desc != data.Desc {
		idc.Name = name
		idc.Desc = data.Desc
		err = a.role.Store(idc)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}
	utils.JsonRespond(200, "修改资产类型成功", "", c)
	return
}

func (a *AssetRoleService) DelRole(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.role.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	maps := make(map[string]interface{})
	maps["pid"] = c.Param("id")
	rows, err := a.detail.GetRows(maps)
	if len(rows) > 0 {
		utils.JsonRespond(500, "请先删除依赖项！", "", c)
		return
	}

	err = a.role.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "删除资产类型成功", "", c)
	return
}