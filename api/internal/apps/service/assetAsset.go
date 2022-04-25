package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"fmt"
	"github.com/360EntSecGroup-Skylar/excelize"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
	"strings"
)

type AssetAssetResource struct {
	Rid				int64   `json:"rid"`
	Did				int64   `json:"did"`
	Status 			int     `json:"status"`
	Name      		string 	`json:"name" gorm:"type:varchar(32)"`
	UserName      	string 	`json:"userName" gorm:"type:varchar(32)"`
	Channel      	string 	`json:"channel" gorm:"type:varchar(128)"`
	Sn 				string 	`json:"sn" gorm:"type:varchar(64)"`
	Mac				string 	`json:"mac" gorm:"type:varchar(64)"`
	Price 			int 	`json:"price"`
	Warranty 		int 	`json:"warranty"`
	BuyDate			string 	`json:"buyDate" gorm:"type:varchar(32)"`
	Desc  			string 	`json:"desc" gorm:"type:varchar(200)"`
}


type AssetAssetService struct {
	config  *config.AppConfig
	user 	repo.SystemUserRepository
	asset 	repo.AssetAssetRepository
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewAssetAssetService(
	config *config.AppConfig,
	user 	repo.SystemUserRepository,
	asset repo.AssetAssetRepository,
	auth *middleware.TokenAuthMiddlewareService) *AssetAssetService {
	return &AssetAssetService{config: config, user:user, asset: asset, auth: auth}
}

func (a *AssetAssetService) GetAsset(c *gin.Context)  {
	var count int
	maps 	:= make(map[string]interface{})
	data 	:= make(map[string]interface{})
	vagues 	:= make(map[string]interface{})
	name 	:= strings.TrimSpace(c.Query("name"))
	if name != "" {
		vagues["name"] = name
	}
	userName := strings.TrimSpace(c.Query("userName"))
	if userName != "" {
		vagues["user_name"] = userName
	}
	sn := strings.TrimSpace(c.Query("sn"))
	if sn != "" {
		vagues["sn"] = sn
	}
	status := c.Query("status")
	if status != "" {
		maps["status"] = status
	}
	rid := c.Query("rid")
	if rid != "" {
		maps["rid"] = rid
	}
	assets, err 	:= a.asset.GetVagueRows(maps, vagues)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	count = len(assets)
	data["list"] = assets
	data["count"] = count
	utils.JsonRespond(200, "", data, c)
	return
}

func (a *AssetAssetService) PostAsset(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.asset.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetAssetResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	fmt.Println(data)
	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res,_ := a.asset.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "重复的资产，请检查！", "", c)
		return
	}

	newAsset := repo.AssetAsset {
		Name: name,
		UserName: strings.TrimSpace(data.UserName),
		Sn: data.Sn,
		Mac: data.Mac,
		Rid: data.Rid,
		Did: data.Did,
		Status: data.Status,
		Price: data.Price,
		Channel: data.Channel,
		BuyDate: data.BuyDate,
		Warranty: data.Warranty,
		Desc: data.Desc}
	err = a.asset.Store(&newAsset)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "添加成功", "", c)
}


func (a *AssetAssetService) ImportAsset(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.asset.import") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	data 	:= make(map[string]interface{})
	file, _, err := c.Request.FormFile("file")
	defer file.Close()
	if err != nil {
		utils.JsonRespond(http.StatusBadRequest, "文件上传失败", "", c)
		return
	}

	f,err := excelize.OpenReader(file)
	if err != nil {
		utils.JsonRespond(http.StatusBadRequest, "文件读取失败", "", c)
		return
	}

	skip	:= []int{}
	dbfail	:= []int{}
	success := []int{}
	rows:= f.GetRows("Sheet1")
	fmt.Println(len(rows))
	for k, row := range rows {
		// 第1行是表头 略过
		if k == 0 {
			continue
		}

		asset 			:= repo.AssetAsset{}
		asset.Name 		= strings.TrimSpace(row[0])
		asset.Rid, _ 	= strconv.ParseInt(strings.TrimSpace(row[1]), 10, 64)
		asset.Did, _ 	= strconv.ParseInt(strings.TrimSpace(row[2]), 10, 64)
		asset.UserName 	= strings.TrimSpace(row[3])
		asset.Sn 		= strings.TrimSpace(row[4])
		asset.Mac 		= strings.TrimSpace(row[5])
		asset.Channel 	= strings.TrimSpace(row[6])
		asset.Price, _ 	= strconv.Atoi(row[7])
		asset.Warranty,_ = strconv.Atoi(row[8])
		asset.BuyDate 	= strings.TrimSpace(row[9])
		asset.Desc 		= strings.TrimSpace(row[10])

		maps 		:= make(map[string]interface{})
		maps["sn"] 	= asset.Sn
		maps["mac"]	= asset.Mac
		if asset.Name != "" {
			maps["name"] = asset.Name
			asset.Status = 2
		} else {
			asset.Status = 1
		}
		res,_ := a.asset.GetRow(maps)
		if res.ID > 0 {
			skip = append(skip, k)
			continue
		}

		err = a.asset.Store(&asset)
		if err != nil {
			dbfail 	= append(dbfail, k)
			continue
		}

		success = append(success, k)
	}

	data["skip"] 	= skip
	data["dbfail"]	= dbfail
	data["success"]	= success

	utils.JsonRespond(200, "导入成功", data, c)
}

func (a *AssetAssetService) PutAsset(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.asset.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data AssetAssetResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	fmt.Println(data)
	maps 	:= make(map[string]interface{})
	id64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	asset,err := a.asset.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	maps["sn"] = strings.TrimSpace(data.Sn)
	res, _ := a.asset.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "资产重复！", "", c)
		return
	}

	asset.Name = name
	asset.UserName= strings.TrimSpace(data.UserName)
	asset.Rid = data.Rid
	asset.Did = data.Did
	asset.Sn  = data.Sn
	asset.Mac = data.Mac
	asset.Channel = data.Channel
	asset.Price = data.Price
	asset.BuyDate = data.BuyDate
	asset.Warranty = data.Warranty
	if data.Status != 0 {
		asset.Status = data.Status
	}
	asset.Desc = data.Desc
	err = a.asset.Store(asset)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "修改成功", "", c)
	return
}

func (a *AssetAssetService) DelAsset(c *gin.Context)  {
	if !a.auth.PermissionCheckMiddleware(c, "asset.asset.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	err := a.asset.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "删除成功", "", c)
	return
}