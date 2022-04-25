package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/db"
	"cmdb/internal/infras/logging"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"errors"
	"fmt"
	"github.com/dgryski/dgoogauth"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"github.com/google/uuid"
	"github.com/skip2/go-qrcode"
	"os"
	"strconv"
	"strings"
	"time"
)

type LoginResource struct {
	Username    string    `form:"username"`
	Password 	string    `form:"password"`
	Secret		string	  `form:"secret"`
	Type 		string	  `form:"type"`
}

type UserResource struct {
	Name   		string    	`form:"name"`
	Nickname    string		`form:"nickname"`
	Mobile      string		`form:"mobile"`
	Email 		string 		`form:"email"`
	Rid 		int64 		`form:"rid"`
	Password 	string    	`form:"password"`
	IsActive	int 		`form:"is_active"`
	TwoFactor	int 		`form:"two_factor"`
}

type UserPermResource struct {
	Code       []int64 		`json:code`
}

// UserService user service
type UserService struct {
	config  *config.AppConfig
	user 	repo.SystemUserRepository
	perm 	repo.MenuPermRelRepository
	up 		repo.UserPermRelRepository
	setting repo.SystemSettingRepository
	rds 	*redis.Client
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewUserService(config *config.AppConfig,
					user repo.SystemUserRepository,
					perm repo.MenuPermRelRepository,
					up repo.UserPermRelRepository,
					setting repo.SystemSettingRepository,
					rds *redis.Client,
					auth *middleware.TokenAuthMiddlewareService) *UserService {
	return &UserService{config: config, user: user, perm: perm, up: up, setting: setting, auth: auth, rds: rds}
}

func (u *UserService) Login(c *gin.Context)  {
	var data LoginResource
	var expiration  = time.Duration(86400)*time.Second

	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	username	:= strings.TrimSpace(data.Username)
	password 	:= data.Password
	maps 		:= make(map[string]interface{})
	maps["name"] = username
	user, _ 	:= u.user.GetRow(maps)
	if user.ID == 0 && data.Type == "default" {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	if user.ID == 0 && data.Type == "ldap" {
		// ldap 登录， 用户还没有同步到user表
		err = u.LdapLogin(0, username, password)
		logging.Info(err)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
		utils.JsonRespond(200, "ldap登录成功，默认权限已经开通，更多权限请联系管理员授权！", "", c)
		return
	}

	key := username + "_login"
	if user.IsActive == 1 {
		var success = false
		if data.Type == "ldap" {
			// ldap 登录， 用户已经同步到user表
			err = u.LdapLogin(1, username, password)
			logging.Info(err)
			if err == nil {
				success = true
			}
		} else {
			success = utils.CheckPasswordHash(password, user.PasswordHash)
		}

		if !success {
			// 记录用户验证失败次数
			// 检查key是否存在 1: 存在， 0: 不存在
			if u.rds.Exists(key).Val() == 1 {
				// 获取key的值
				num, _ := u.rds.Get(key).Int()
				// 如果验证失败次数多于3次，将锁定用户
				if num > 3 {
					utils.JsonRespond(401, "用户已被禁用，请联系管理员", "", c)
					return
				}

				if err := db.SetValByKey(u.rds, key, num+1, expiration); err != nil {
					if err != nil {
						utils.JsonRespond(500, err.Error(), "", c)
						return
					}
				}
			} else {
				// 第一次登录失败
				if e := db.SetValByKey(u.rds, key, 1, expiration); e != nil {
					logging.Error(err)
				}
			}
			utils.JsonRespond(401, "用户名或密码错误，连续3次错误将会被禁用！", "", c)
			return
		} else {
			// 如果启用双因子认证
			if user.TwoFactor == 1 {
				if data.Secret == "" {
					utils.JsonRespond(401, "动态口令不能为空！", "", c)
					return
				}

				totoconf := dgoogauth.OTPConfig{
					Secret: user.Secret,
					WindowSize: 3,
					HotpCounter:  0,
					ScratchCodes: []int{},
				}

				isSecret, err := totoconf.Authenticate(data.Secret)
				if err != nil || !isSecret {
					utils.JsonRespond(401, err.Error(), "", c)
					return
				}
			}
			//生成token
			token := uuid.New().String()
			user.AccessToken = token
			user.TokenExpired = time.Now().Unix() + 86400

			//提交更改
			u.user.Store(user)
			// 获取用户的权限列表
			var permissions  []string
			if user.IsSupper != 1 {
				var rolePermissions, userPermissions []string
				rolePermissions = u.perm.ReturnPermissions(*user)
				userPermissions	= u.up.ReturnPermissions(*user)
				permissions 	= utils.UnionTwoSlice(rolePermissions, userPermissions)
			}

			item 				:= make(map[string]interface{})
			item["rid"]			= user.Rid
			item["token"] 		= token
			item["is_supper"] 	= user.IsSupper
			item["nickname"]	= user.Nickname
			item["permissions"]	= permissions

			// 登录成功
			if e := db.SetValByKey(u.rds, key, 0, expiration); e != nil {
				logging.Error(e)
			}

			utils.JsonRespond(200, "",item, c)
			return
		}
	} else {
		utils.JsonRespond(500, "用户被禁用，请联系管理员！", "", c)
		return
	}
}

func (u *UserService) LdapLogin(status int, username, password string) (err error) {
	ldapSetting, err := u.setting.GetByName("ldap_service")
	if err != nil {
		return
	}
	if ldapSetting.ID == 0 {
		err = errors.New("没有找到系统默认LDAP设置，无法验证用户信息，请先联系管理员设置！")
	}
	var data LdapResource
	utils.JsonUnmarshalFromString(ldapSetting.Value, &data)
	port		:= data.Port
	searchDn  	:= strings.TrimSpace(data.SearchDn)
	searchPwd 	:= strings.TrimSpace(data.SearchPwd)
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
		return
	}
	success, attributes, err := ad.Auth(username, password)
	if !success {
		return
	}
	// status 0:用户没有同步到user表里
	if status == 0 {
		token := uuid.New().String()
		newUser := repo.SystemUser{
			Name: username,
			Rid: 1,
			AccessToken: token,
			TokenExpired: time.Now().Unix() + 86400,
			Nickname: attributes["displayName"][0],
			Email: attributes["mail"][0],
			IsActive:1,
			Type: 2}
		err = u.user.Store(&newUser)
		if err != nil {
			return
		}
	}
	return
}

func (u *UserService) Logout(c *gin.Context)  {
	Uid, _ := c.Get("Uid")
	err := u.user.Logout(Uid.(int64))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "退出成功！", "", c)
}

func (u *UserService) GetUser(c *gin.Context)  {
	var count int
	maps := make(map[string]interface{})
	data := make(map[string]interface{})
	name := c.Query("name")
	if name != "" {
		maps["name"] = name
	}
	pageSize 	:= utils.GetPageSize(c, u.config.PageSize)
	page 		:= utils.GetPage(c, pageSize)
	users, err 	:= u.user.GetUser(maps, page, pageSize)
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

func (u *UserService) PostUser(c *gin.Context)  {
	if !u.auth.PermissionCheckMiddleware(c, "system.user.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data UserResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, "Invalid Add User Data: " + err.Error(), "", c)
		return
	}
	fmt.Println(data)
	// 用户唯一性检查
	name := strings.TrimSpace(data.Name)
	maps := make(map[string]interface{})
	maps["name"] = name
	user, _ := u.user.GetRow(maps)
	if user.ID > 0 {
		utils.JsonRespond(500, "重复的用户名，请检查！", "", c)
		return
	}
	PasswordHash, err := utils.HashPassword(data.Password)
	if err != nil {
		utils.JsonRespond(500, "hash密码错误，请联系管理员！", "", c)
		return
	}
	newUser := repo.SystemUser{
		Name: name,
		Nickname: data.Nickname,
		Mobile: data.Mobile,
		Email:data.Email,
		IsActive:1,
		Type: 1,
		PasswordHash: PasswordHash,
		Rid: data.Rid}
	// 检查是否启用双因子认证
	var qrPath = ""
	var sub string
	var message string
	sub 	= "用户创建成功"
	message	= "你的用户已经创建，用户名为 ： " + name + "初始密码为 ：" + data.Password + "。 请及时登录平台到个人中心修改。"
	if data.TwoFactor == 1 {
		secret, err := utils.RandString()
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
		newUser.TwoFactor 	= data.TwoFactor
		newUser.Secret 		= secret
		qrPath, err = u.CreateQr(name, secret)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
		sub 	= "用户创建成功"
		message	= "你的用户已经创建，用户名为 ： " + name + "初始密码为 ：" + data.Password + "。 " +
			"请及时登录平台到个人中心修改。\r你已经启用了双因子认证，请用相应工具扫描附件的二维码或者访问平台地址："+
			u.config.ImagePrefixUrl + "/upload/images/qr/" + name + ".png"
	}

	mailInfo := &utils.EmailBody{
		To: []string{data.Email},
		Subject: sub,
		Body: message,
		Annex: qrPath,
	}
	logging.Info(mailInfo.To)
	logging.Info(mailInfo.Subject)
	logging.Info(mailInfo.Body)
	logging.Info(mailInfo.Annex)
	if err = u.SendEmail(mailInfo); err != nil {
		logging.Error(err)
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	err = u.user.Store(&newUser)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "添加用户成功", "", c)
	return
}

func (u *UserService) PutUser(c *gin.Context) {
	if !u.auth.PermissionCheckMiddleware(c, "system.user.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data UserResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, "Invalid Edit User Data: "+err.Error(), "", c)
		return
	}
	maps := make(map[string]interface{})
	maps["id"] = c.Param("id")
	user, err := u.user.GetRow(maps)
	user.Nickname 	= data.Nickname
	user.Mobile  	= data.Mobile
	user.Email 		= data.Email
	user.Rid  		= data.Rid
	user.IsActive	= data.IsActive
	if len(data.Password) > 0 {
		PasswordHash, err := utils.HashPassword(data.Password)
		if err != nil {
			utils.JsonRespond(500, "hash密码错误，请联系管理员！", "", c)
			return
		}
		user.PasswordHash = PasswordHash
	}
	if user.TwoFactor != data.TwoFactor && data.TwoFactor == 1 {
		secret, err := utils.RandString()
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
		user.Secret 	= secret
		sub 	:= "用户修改成功"
		message	:= "你已经启用了双因子认证，请用相应工具扫描附件的二维码或者访问平台地址："+
			u.config.ImagePrefixUrl + "/" + u.config.RuntimeRootPath + u.config.ImageSavePath + "qr"+ "/"+user.Name+".png"
		qrPath, err := u.CreateQr(user.Name, secret)
		mailInfo := &utils.EmailBody{
			To: []string{user.Email},
			Subject: sub,
			Body: message,
			Annex: qrPath,
		}
		fmt.Println(mailInfo)
		if err = u.SendEmail(mailInfo); err != nil {
			logging.Error(err)
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}
	user.TwoFactor  = data.TwoFactor
	err = u.user.Store(user)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "修改用户成功", "", c)
}

func (u *UserService) Delete(c *gin.Context)  {
	if !u.auth.PermissionCheckMiddleware(c, "system.user.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	err := u.user.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "删除用户成功", "", c)
}

func (u *UserService) GetUserPerm(c *gin.Context)  {
	maps := make(map[string]interface{})
	maps["uid"] =  c.Param("id")
	res, err := u.up.GetSelectRows(maps, "pid")
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	data := make(map[string]interface{})
	data["list"] = res
	utils.JsonRespond(200, "",data, c)
	return
}

func (u *UserService) PostUserPerm(c *gin.Context)  {
	if !u.auth.PermissionCheckMiddleware(c, "system.user.perm") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data  UserPermResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	maps 		:= make(map[string]interface{})
	maps["uid"] = c.Param("id")
	oldUserPerm, err := u.up.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	uid64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	menuTempRds	:= make(map[int64]interface{})
	userPerm	:= make(map[int64]interface{})
	newUserPerm	:= make(map[int64]interface{})

	delete(maps, "uid")
	maps["type"] = repo.MenuPermTypeMap["menu"]
	perms, err := u.perm.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	// 可以把所有的 type=1 的菜单选项id 放到 menuTempRds里
	for _, item := range perms {
		menuTempRds[item.ID]	= item.ID
	}

	for _, v := range data.Code {
		if _, ok  := menuTempRds[v]; ok {
			continue
		}
		newUserPerm[v] = v
	}

	// 删除
	for _, k := range oldUserPerm {
		userPerm[k.Pid] = k.Pid
		if _, ok  := newUserPerm[k.Pid]; !ok {
			// 执行删除操作
			err = u.up.DeleteByUid(k.Pid)
			if err != nil {
				utils.JsonRespond(500, err.Error(), "", c)
				return
			}
		}
	}

	// 新增
	for k,_ := range newUserPerm {
		if _, ok  := userPerm[k]; !ok {
			// todo
			//执行新增操作，换成批量插入更好
			rpr := &repo.UserPermRel{
				Pid: k,
				Uid: uid64}
			err = u.up.Store(rpr)
			if err != nil {
				utils.JsonRespond(500, err.Error(), "", c)
				return
			}
		}
	}

	////更新redis里面的User的权限集合
	//key := db.UserMenuListKey
	//key =  key + c.Param("id")
	//// 先删除key
	//u.rds.Del(key)
	//// 再添加
	//u.perm.SetUserPermToSet(key, uid64)
	utils.JsonRespond(200, "跟新用户功能权限成功！","", c)
}

func (u *UserService) CreateQr(name, secret string) (string, error) {
	otpConf := dgoogauth.OTPConfig {
		Secret:       secret,
		WindowSize:   3,
		HotpCounter:  0,
		ScratchCodes: []int{},
	}
	qrUrl := otpConf.ProvisionURIWithIssuer(name, "")
	dir, err := os.Getwd()
	if err != nil {
		return "", err
	}
	path := dir + "/" + u.config.RuntimeRootPath + u.config.ImageSavePath + "qr"
	if err = logging.IsNotExistMkDir(path); err != nil {
		return "", err
	}
	if err := qrcode.WriteFile(qrUrl, qrcode.Medium, 256, path+"/"+name+".png"); err != nil {
		return "", err
	}
	return path + "/"+name+".png", nil
}

func (u *UserService) SendEmail(mailBody *utils.EmailBody) error {
	emailSetting, err := u.setting.GetByName("mail_service")
	if err != nil {
		return err
	}
	if emailSetting.ID == 0 {
		return errors.New("没有找到系统默认邮箱设置，无法发送系统邮件，请先设置系统默认发送邮箱！")
	}
	var data MailResource
	utils.JsonUnmarshalFromString(emailSetting.Value, &data)
	port, _ := strconv.Atoi(data.Port)
	gd := utils.CreateDialer(data.Server,  data.Username, data.Password, port)
	mailBody.From = data.Username
	if mailBody.Annex == "" {
		return  utils.SendMsg(gd, utils.CreateMsg(mailBody))
	} else {
		return  utils.SendMsg(gd, utils.CreateMsgWithAnnex(mailBody))
	}
}



