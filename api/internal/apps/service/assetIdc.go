package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"github.com/gin-gonic/gin"
	"strings"
)

type IdcResource struct {
	Name    	string    	`form:"name"`
	Address 	string		`form:"address"`
	Contact		string		`form:"contact"`
	Mobile		string		`form:"mobile"`
	Network		string		`form:"network"`
	Desc 		string    	`form:"desc"`
}

type AssetIdcResource struct {
	Name    	string    	`form:"name"`
	Desc 		string    	`form:"desc"`
}

type AssetIdcService struct {
	config  *config.AppConfig
	idc 	repo.AssetIdcRepository
	asset   repo.AssetAssetRepository
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewAssetIdcService(config *config.AppConfig,
	idc repo.AssetIdcRepository,
	asset repo.AssetAssetRepository,
	auth *middleware.TokenAuthMiddlewareService) *AssetIdcService {
	return &AssetIdcService{config: config, idc: idc, asset: asset, auth: auth}
}

func (a *AssetIdcService) GetIdc(c *gin.Context)  {
	var count int
	maps := make(map[string]interface{})
	data := make(map[string]interface{})
	name := c.Query("name")
	if name != "" {
		maps["name"] = name
	}
	users, err 	:= a.idc.GetRows(maps)
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

func (a *AssetIdcService) PostIdc(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.dc.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data IdcResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	// idc名唯一性检查
	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res,_ := a.idc.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "重复的IDC名，请检查！", "", c)
		return
	}
	newIdc := repo.AssetIdc {
		Name: name,
		Address: data.Address,
		Contact: data.Contact,
		Mobile: data.Mobile,
		Network: data.Network,
		Desc: data.Desc}
	err = a.idc.Store(&newIdc)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "添加idc成功", "", c)
}

func (a *AssetIdcService) PutIdc(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.dc.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data IdcResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps 	:= make(map[string]interface{})
	id64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	idc,err := a.idc.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := a.idc.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "角色名重复！", "", c)
		return
	}
	var isChange = false
	if idc.Name != name {
		idc.Name = name
		isChange = true
	}
	if idc.Address != data.Address {
		idc.Address = data.Address
		isChange = true
	}
	if idc.Contact != data.Contact {
		idc.Contact = data.Contact
		isChange = true
	}
	if idc.Mobile != data.Mobile {
		idc.Mobile = data.Mobile
		isChange = true
	}
	if idc.Network != data.Network {
		idc.Network = data.Network
		isChange = true
	}

	if  idc.Desc != data.Desc {
		idc.Desc = data.Desc
		isChange = true
	}
	if isChange {
		err = a.idc.Store(idc)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}
	utils.JsonRespond(200, "修改idc成功", "", c)
	return
}

func (a *AssetIdcService) DelIdc(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.dc.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	// 检查dc是否有资源绑定
	maps := make(map[string]interface{})
	maps["did"] = c.Param("id")
	rows, err  := a.asset.GetRows(maps)
	if len(rows) > 0 {
		utils.JsonRespond(500, "请先删除依赖项！", "", c)
		return
	}
	err = a.idc.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "删除dc成功", "", c)
	return
}
