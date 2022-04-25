package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"github.com/gin-gonic/gin"
	"strings"
)

type AssetRoleDetailResource struct {
	Pid         int64 	 	`form:"pid"`
	Name    	string    	`form:"name"`
	Config    	string    	`form:"config"`
	Desc 		string    	`form:"desc"`
}

type AssetRoleDetailService struct {
	config  	*config.AppConfig
	asset 	repo.AssetAssetRepository
	roleDetail 	repo.AssetRoleDetailRepository
	auth 		*middleware.TokenAuthMiddlewareService
}

func NewAssetRoleDetailService(config *config.AppConfig,
	roleDetail repo.AssetRoleDetailRepository,
	asset repo.AssetAssetRepository,
	auth *middleware.TokenAuthMiddlewareService) *AssetRoleDetailService {
	return &AssetRoleDetailService{config: config, roleDetail: roleDetail, asset: asset, auth: auth}
}

func (a *AssetRoleDetailService) GetRoleDetail(c *gin.Context)  {
	var count int
	maps := make(map[string]interface{})
	data := make(map[string]interface{})
	name := c.Query("name")
	if name != "" {
		maps["name"] = name
	}
	users, err 	:= a.roleDetail.GetRows(maps)
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

func (a *AssetRoleDetailService) PostRoleDetail(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.roleDetail.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetRoleDetailResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res,_ := a.roleDetail.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "重复的资产类型名，请检查！", "", c)
		return
	}
	newRoleDetail := repo.AssetRoleDetail {
		Pid: 	data.Pid,
		Name: 	name,
		Config: data.Config,
		Desc: 	data.Desc,
	}
	err = a.roleDetail.Store(&newRoleDetail)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "添加资产类型成功", "", c)
}

func (a *AssetRoleDetailService) PutRoleDetail(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.roleDetail.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetRoleDetailResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps 	:= make(map[string]interface{})
	id64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	item,err := a.roleDetail.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := a.roleDetail.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "资产型号名重复！", "", c)
		return
	}

	if item.Name != name || item.Desc != data.Desc || item.Config != data.Config || item.Pid != data.Pid {
		item.Name = name
		item.Pid  = data.Pid
		item.Config = data.Config
		item.Desc = data.Desc
		err = a.roleDetail.Store(item)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}
	utils.JsonRespond(200, "修改资产类型成功", "", c)
	return
}

func (a *AssetRoleDetailService) DelRoleDetail(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.roleDetail.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	maps := make(map[string]interface{})
	maps["rid"] = c.Param("id")
	rows, err := a.asset.GetRows(maps)
	if len(rows) > 0 {
		utils.JsonRespond(500, "请先删除依赖项！", "", c)
		return
	}

	err = a.roleDetail.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "删除资产类型成功", "", c)
	return
}