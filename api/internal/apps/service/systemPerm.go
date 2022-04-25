package service

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/db"
	"cmdb/internal/infras/utils"
	"cmdb/internal/middleware"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"sort"
	"strings"
)

type MenuResource struct {
	Name    	string    `form:"name"`
	Icon 		string    `form:"icon"`
	Type 		int    	  `form:"type"`
}

type SubMenuResource struct {
	Name    	string    `form:"name"`
	Url 		string    `form:"url"`
	Icon 		string    `form:"icon"`
	Type 		int    	  `form:"type"`
	Pid    		int64 	  `form:"pid"`
	Desc        string    `form:"desc"`
}

type PermResource struct {
	Name    	string    `form:"name"`
	Perm  		string    `form:"perm"`
	Type 		int    	  `form:"type"`
	Pid         int64 	  `form:"pid"`
	Desc        string    `form:"desc"`
}

type PermService struct {
	config  *config.AppConfig
	user 	repo.SystemUserRepository
	perm 	repo.MenuPermRelRepository
	rds 	*redis.Client
	auth 	*middleware.TokenAuthMiddlewareService
}


func NewPermService(config *config.AppConfig,
	user repo.SystemUserRepository,
	perm repo.MenuPermRelRepository,
	rds *redis.Client,
	auth *middleware.TokenAuthMiddlewareService) *PermService {
	return &PermService{config: config, user: user, perm: perm, auth: auth, rds: rds}
}

type MenuPermRelSort []repo.MenuPermRel
func (s MenuPermRelSort) Len() int {
	//返回传入数据的总数
	return len(s)
}
func (s MenuPermRelSort) Swap(i, j int) {
	//两个对象满足Less()则位置对换
	//表示执行交换数组中下标为i的数据和下标为j的数据
	s[i], s[j] = s[j], s[i]
}
func (s MenuPermRelSort) Less(i, j int) bool {
	//按字段比较大小,此处是降序排序
	//返回数组中下标为i的数据是否小于下标为j的数据
	return s[i].ID < s[j].ID
}

func (p *PermService) GetUserMenu(c *gin.Context)  {
	var res []repo.MenuPermRel

	uid , _ := c.Get("Uid")

	fmt.Println(uid)

	rid 	:= c.Param("id")
	rid64,_ := utils.S.Int64(utils.S(rid))
	tmp 	:= make(map[int64]*repo.MenuPermRel)
	data 	:= make(map[string]interface{})
	// 由于返回用户菜单列表需要查询数据库并进行结构格式化操作，故放到redis加速
	key := db.RoleMenuListKey
	key = key + rid
	value,_ := p.rds.Get(key).Result()
	if value != "" {
		data["list"]	= utils.JsonUnmarshalFromString(value, &res)
		utils.JsonRespond(200, "", data, c)
		return
	}

	menus, err := p.perm.GetMenu()
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	if rid == "0" {
		for _, m := range menus {
			if x, ok := tmp[m.ID]; ok {
				m.Children = x.Children
			}
			tmp[m.ID] = m
			if m.Pid != 0 {
				if x, ok  := tmp[m.Pid]; ok {
					x.Children = append(x.Children, m)
				} else  {
					tmp[m.Pid] = &repo.MenuPermRel{
						Children: []*repo.MenuPermRel{m},
					}
				}
			}
		}
	} else {
		rolePids, err := p.perm.GetRoleMenuPid(rid64)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}

		userId, _ 	:= c.Get("Uid")
		key			= key + userId.(string)
		uid, _ 		:= userId.(int64)
		userPids, err := p.perm.GetUserMenuPid(uid)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}

		pids := utils.UnionTwoInt64Slice(rolePids, userPids)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
		for _,m := range menus {
			for _,pid := range pids {
				if _, ok := tmp[m.ID]; !ok {
					tmp[m.ID] = m
				}
				if pid == m.ID {
					if x, ok  := tmp[m.Pid]; ok {
						x.Children = append(x.Children, m)
					}
				}
			}
		}
	}

	for _, v := range tmp {
		if v.Pid == 0 {
			res = append(res, *v)
		}
	}
	sort.Sort(MenuPermRelSort(res))
	p.rds.Set(key, utils.JSONMarshalToString(res), 0)
	data["list"] = res
	utils.JsonRespond(200, "", data, c)
}

func (p *PermService) GetRoleUserMenu(c *gin.Context)  {
	var res []repo.MenuPermRel
	rid 	:= c.Param("id")
	rid64,_ := utils.S.Int64(utils.S(rid))
	tmp 	:= make(map[int64]*repo.MenuPermRel)
	data 	:= make(map[string]interface{})
	// 由于返回用户菜单列表需要查询数据库并进行结构格式化操作，故放到redis加速
	key := db.RoleMenuListKey
	key = key + rid
	value,_ := p.rds.Get(key).Result()
	if value != "" {
		data["list"]	= utils.JsonUnmarshalFromString(value, &res)
		utils.JsonRespond(200, "", data, c)
		return
	}

	menus, err := p.perm.GetMenu()
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	if rid == "0" {
		for _, m := range menus {
			if x, ok := tmp[m.ID]; ok {
				m.Children = x.Children
			}
			tmp[m.ID] = m
			if m.Pid != 0 {
				if x, ok  := tmp[m.Pid]; ok {
					x.Children = append(x.Children, m)
				} else  {
					tmp[m.Pid] = &repo.MenuPermRel{
						Children: []*repo.MenuPermRel{m},
					}
				}
			}
		}
	} else {
		rolePids, err := p.perm.GetRoleMenuPid(rid64)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}

		userId, _ 	:= c.Get("Uid")
		uidString,_ :=  userId.(string)
		key			= key + uidString
		uid, _ 		:= userId.(int64)
		userPids, err := p.perm.GetUserMenuPid(uid)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}

		pids := utils.UnionTwoInt64Slice(rolePids, userPids)
		for _,m := range menus {
			for _,pid := range pids {
				if _, ok := tmp[m.ID]; !ok {
					tmp[m.ID] = m
				}
				if pid == m.ID {
					if x, ok  := tmp[m.Pid]; ok {
						x.Children = append(x.Children, m)
					}
				}
			}
		}
	}

	for _, v := range tmp {
		if v.Pid == 0 {
			res = append(res, *v)
		}
	}
	sort.Sort(MenuPermRelSort(res))
	p.rds.Set(key, utils.JSONMarshalToString(res), 0)
	data["list"] = res
	utils.JsonRespond(200, "", data, c)
}

// GetAllPerm 获取所有的权限项
func (p *PermService) GetAllPerm(c *gin.Context)  {
	var 	res []repo.MenuPermRel
	maps 	:= make(map[string]interface{})
	data   	:= make(map[string]interface{})
	tmp   	:= make(map[int64]*repo.MenuPermRel)
	// 所有的mod page perm组合数据 放到redis里面
	key 	:= db.AllPermsKey
	v, _  	:= p.rds.Get(key).Result()
	if v != "" {
		data["list"] = utils.JsonUnmarshalFromString(v, &res)
		utils.JsonRespond(200, "", data, c)
		return
	}
	perms, err := p.perm.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	for _, perm := range perms {
		if x, ok := tmp[perm.ID]; ok {
			perm.Children = x.Children
		}
		tmp[perm.ID] = perm
		if perm.Pid != 0 {
			if x, ok  := tmp[perm.Pid]; ok {
				x.Children = append(x.Children, perm)
			} else  {
				tmp[perm.Pid] = &repo.MenuPermRel{
					Children: []*repo.MenuPermRel{perm},
				}
			}
		}
	}
	for _, item := range tmp {
		if item.Pid == 0 {
			res = append(res, *item)
		}
	}

	p.rds.Set(key, utils.JSONMarshalToString(res), 0)
	data["list"] = res
	utils.JsonRespond(200, "", data, c)
}

func (p *PermService) DelRedisAllPermKey()  {
	key := db.AllPermsKey
	p.rds.Del(key).Err()
}

func (p *PermService) GetMenuOrPerm(c *gin.Context)  {
	var isSubMenu =  false
	maps 	:= make(map[string]interface{})
	data 	:= make(map[string]interface{})
	vagues 	:= make(map[string]interface{})
	name 	:= strings.TrimSpace(c.Query("name"))
	if name != "" {
		vagues["perm"] = name
	}
	pid := c.Query("pid")
	if pid != "" {
		maps["pid"] = pid
	}
	mType := c.Query("type")
	if mType != "" {
		//菜单
		maps["type"] = mType
		sub := c.Query("isSubMenu")
		if sub != "" {
			isSubMenu = true
		} else {
			maps["pid"] = 0
		}
	} else {
		//权限项
		maps["type"] = repo.MenuPermTypeMap["perm"]
	}

	pageSize 	:= utils.GetPageSize(c, p.config.PageSize)
	page 		:= utils.GetPage(c, pageSize)
	perms, err 	:=  p.perm.GetMenuOrPerm(maps, vagues, isSubMenu, page, pageSize)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	count, err := p.perm.GetRowCount(maps,vagues, isSubMenu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	data["list"] = perms
	data["count"] = count
	utils.JsonRespond(200, "", data, c)
	return
}

func (p *PermService) PostPerm(c *gin.Context) {
	if !p.auth.PermissionCheckMiddleware(c, "system.perm.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data PermResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	// 权限标识唯一性检查
	maps := make(map[string]interface{})
	perm := strings.TrimSpace(data.Perm)
	maps["perm"] = perm
	maps["type"] = data.Type
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "权限标识重复！", "", c)
		return
	}
	menu := &repo.MenuPermRel{
		Name: strings.TrimSpace(data.Name),
		Perm: perm,
		Pid: data.Pid,
		Desc: data.Desc,
		Type: data.Type}
	err = p.perm.Store(menu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	p.DelRedisAllPermKey()
	utils.JsonRespond(200, "添加权限项成功", "", c)
	return
}

func (p *PermService) PutPerm(c *gin.Context)  {
	if !p.auth.PermissionCheckMiddleware(c, "system.perm.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data PermResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps := make(map[string]interface{})
	id64,_ := utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	item,err := p.perm.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	delete(maps, "id")
	perm := strings.TrimSpace(data.Perm)
	maps["perm"] = perm
	maps["type"] = repo.MenuPermTypeMap["perm"]
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "权限标识重复！", "", c)
		return
	}
	item.Name = strings.TrimSpace(data.Name)
	item.Pid  = data.Pid
	item.Perm = data.Perm
	item.Desc = data.Desc
	err = p.perm.Store(item)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	p.DelRedisAllPermKey()
	utils.JsonRespond(200, "修改权限项成功", "", c)
	return
}

func (p *PermService) DelPerm(c *gin.Context) {
	if !p.auth.PermissionCheckMiddleware(c, "system.perm.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	// todo
	// 检查权限项关联

	err := p.perm.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	utils.JsonRespond(200, "删除权限项成功", "", c)
	return
}

func (p *PermService) PostMenu(c *gin.Context) {
	if !p.auth.PermissionCheckMiddleware(c, "system.menu.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data MenuResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	//唯一性检查
	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "菜单名重复！", "", c)
		return
	}
	menu := &repo.MenuPermRel{
		Name: name,
		Icon: data.Icon,
		Type: data.Type}
	err = p.perm.Store(menu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	p.DelRedisAdminRoleRecord()
	utils.JsonRespond(200, "添加菜单成功", "", c)
	return
}

func (p *PermService) PutMenu(c *gin.Context)  {
	if !p.auth.PermissionCheckMiddleware(c, "system.menu.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data MenuResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps := make(map[string]interface{})
	id64,_ := utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	menu,err := p.perm.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "菜单名重复！", "", c)
		return
	}
	menu.Name = name
	menu.Icon = data.Icon
	err = p.perm.Store(menu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	// 修改管理员菜单列表， 最简单的做法， 删除redis role 为0 的记录
	p.DelRedisAdminRoleRecord()
	utils.JsonRespond(200, "修改菜单成功", "", c)
	return
}

func (p *PermService) DelMenu(c *gin.Context) {
	if !p.auth.PermissionCheckMiddleware(c, "system.menu.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	// 检查菜单是否被权限项关联
	maps := make(map[string]interface{})
	maps["pid"] = c.Param("id")
	res, err := p.perm.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	if len(res) > 0 {
		utils.JsonRespond(500, "该菜单目前被二级菜单或者权限项依赖，请先删除依赖项！", "", c)
		return
	}
	err = p.perm.Delete(c.Param("id"))
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	p.DelRedisAdminRoleRecord()
	utils.JsonRespond(200, "删除菜单成功", "", c)
	return
}

func (p *PermService) PostSubMenu(c *gin.Context) {
	if !p.auth.PermissionCheckMiddleware(c, "system.menu.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data SubMenuResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	//唯一性检查
	maps := make(map[string]interface{})
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 {
		utils.JsonRespond(500, "菜单名重复！", "", c)
		return
	}
	menu := &repo.MenuPermRel{
		Pid: data.Pid,
		Name: name,
		Url: strings.TrimSpace(data.Url),
		Icon: data.Icon,
		Type: data.Type,
		Desc: data.Desc,
	}
	err = p.perm.Store(menu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	p.DelRedisAdminRoleRecord()
	utils.JsonRespond(200, "添加子菜单成功", "", c)
	return
}

func (p *PermService) PutSubMenu(c *gin.Context)  {
	if !p.auth.PermissionCheckMiddleware(c, "system.menu.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data SubMenuResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps := make(map[string]interface{})
	id64,_ := utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	menu,err := p.perm.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := p.perm.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "菜单名重复！", "", c)
		return
	}
	menu.Name = name
	menu.Pid	= data.Pid
	menu.Url	= strings.TrimSpace(data.Url)
	menu.Icon 	= data.Icon
	menu.Desc	= data.Desc
	err = p.perm.Store(menu)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	// 修改管理员菜单列表， 最简单的做法， 删除redis role 为0 的记录
	p.DelRedisAdminRoleRecord()
	utils.JsonRespond(200, "修改子菜单成功", "", c)
	return
}

func (p *PermService) DelRedisAdminRoleRecord()  {
	// 硬性编码管理员的rid为0
	key := db.RoleMenuListKey+"0"
	p.rds.Del(key)
}