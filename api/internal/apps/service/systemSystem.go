package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"runtime"
	"strconv"
	"strings"
)

type SettingResource struct {
	Data 		[]repo.SystemSetting   `form:"name"`
}

type About struct {
	SystemInfo 		string
	GolangVersion 	string
	GinVersion		string
}

type LdapResource struct {
	Add			string		`form:"add"`
	Port		string		`form:"port"`
	BaseDn    	string    	`form:"baseDn"`
	SearchDn    string    	`form:"searchDn"`
	SearchPwd	string    	`form:"searchPwd"`
}

type MailResource struct {
	Server 		string    	`form:"server"`
	Port		string		`form:"port"`
	Username	string  	`form:"username"`
	Password	string		`form:"password"`
	Nickname    string		`form:"nickname"`
}

type SystemService struct {
	config  *config.AppConfig
	set 	repo.SystemSettingRepository
	rds 	*redis.Client
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewSystemService(config *config.AppConfig,
	set  repo.SystemSettingRepository,
	rds *redis.Client,
	auth *middleware.TokenAuthMiddlewareService) *SystemService {
	return &SystemService{config: config, set: set, rds: rds, auth: auth}
}

func (s *SystemService) GetSetting(c *gin.Context)  {
	data := make(map[string]interface{})
	sets, err := s.set.GetSetting()
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	data["list"]	= sets
	utils.JsonRespond(200, "", data, c)
	return
}

func (s *SystemService) SettingModify(c *gin.Context)  {
	if !s.auth.PermissionCheckMiddleware(c, "system.setting.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	var data SettingResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(400, "Invalid Setting Data", "", c)
		return
	}

	for _, v := range data.Data {
		set, _ := s.set.GetByName(v.Name)
		if set.ID > 0 {
			desc := set.Desc
			if v.Desc != "" && v.Desc != desc {
				desc 	= v.Desc
			}
			set.Desc  = desc
			set.Value = v.Value
			err = s.set.Store(set)
		} else {
			err = s.set.Store(&v)
		}
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}

	utils.JsonRespond(200, "操作成功", "", c)
}

func (s *SystemService) LdapCheck(c *gin.Context)  {
	if !s.auth.PermissionCheckMiddleware(c, "system.ldap.test") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data LdapResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	fmt.Println(data)
	port		:= data.Port
	searchDn  	:= strings.TrimSpace(data.SearchDn)
	searchPwd 	:= strings.TrimSpace(data.SearchPwd)
	if searchDn == "" || searchPwd == "" {
		utils.JsonRespond(500, "有搜索权限的BindDN或者密码不能为空", "", c)
		return
	}
	var ad = &utils.LDAP_CONFIG{
		Addr: data.Add+":"+port,
		BaseDn: data.BaseDn,
		BindDn: searchDn,
		BindPass: searchPwd,
		AuthFilter: "(&(sAMAccountName=%s))",
		Attributes: []string{"sAMAccountName", "displayName", "mail"},
		TLS:        false,
		StartTLS:   false,
	}
	err 	= ad.Connect()
	defer ad.Close()
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	success, _, err := ad.Auth(searchDn, searchPwd)
	if !success {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "LDAP测试正常", data, c)
}

func (s *SystemService) EmailCheck(c *gin.Context)  {
	if !s.auth.PermissionCheckMiddleware(c, "system.email.test") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	var data MailResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	port, _ := strconv.Atoi(data.Port)
	gd	    := utils.CreateDialer(data.Server, data.Username, data.Password, port)
	msg     := "This is a test email！"
	msgBody := utils.EmailBody{
		From: data.Username,
		To 	: []string{data.Username},
		Subject: msg,
		Body: msg,
	}
	m 		:= utils.CreateMsg(&msgBody)
	if err = utils.SendMsg(gd, m); err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "邮件测试正常", "", c)
}

func (s *SystemService) About(c *gin.Context)  {
	data 	:= make(map[string]interface{})
	var about  About
	about.GolangVersion = runtime.Version()
	about.SystemInfo 	= runtime.GOOS
	about.GinVersion 	= gin.Version
	data["list"] 		= about

	utils.JsonRespond(200, "", data, c)
}