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
	"strings"
)

type RoleResource struct {
	Name    	string    	`form:"name"`
	Desc 		string    	`form:"desc"`
}

type RolePermResource struct {
	Code       []int64 		`json:code`
}

type RoleService struct {
	config  *config.AppConfig
	role 	repo.SystemRoleRepository
	perm 	repo.MenuPermRelRepository
	rp 		repo.RolePermRelRepository
	rds 	*redis.Client
	auth 	*middleware.TokenAuthMiddlewareService
}

func NewRoleService(config *config.AppConfig,
	role repo.SystemRoleRepository,
	perm repo.MenuPermRelRepository,
	rp repo.RolePermRelRepository,
	rds *redis.Client,
	auth *middleware.TokenAuthMiddlewareService) *RoleService {
	return &RoleService{config: config, role: role, perm: perm, rp: rp, auth: auth, rds: rds}
}

func (r *RoleService) GetRole(c *gin.Context)  {
	var count int
	maps := make(map[string]interface{})
	data := make(map[string]interface{})
	name := c.Query("name")
	if name != "" {
		maps["name"] = name
	}
	users, err 	:= r.role.GetRole(maps)
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

func (r *RoleService) PostRole(c *gin.Context)  {
	if !r.auth.PermissionCheckMiddleware(c, "system.role.add") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data RoleResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	// 角色名唯一性检查
	maps := make(map[string]interface{})
	maps["name"] = data.Name
	_,err = r.role.GetRole(maps)
	if err != nil {
		utils.JsonRespond(500, "重复的角色名，请检查！", "", c)
		return
	}
	newRole := repo.SystemRole {
		Name: data.Name,
		Desc: data.Desc}
	err = r.role.Store(&newRole)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	utils.JsonRespond(200, "添加角色成功", "", c)
}
func (r *RoleService) PutRole(c *gin.Context)  {
	if !r.auth.PermissionCheckMiddleware(c, "system.role.edit") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data RoleResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	maps := make(map[string]interface{})
	id64,_ := utils.S.Int64(utils.S(c.Param("id")))
	maps["id"] = c.Param("id")
	role,err := r.role.GetRow(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	delete(maps, "id")
	name := strings.TrimSpace(data.Name)
	maps["name"] = name
	res, _ := r.role.GetRow(maps)
	if res.ID > 0 && res.ID != id64 {
		utils.JsonRespond(500, "角色名重复！", "", c)
		return
	}
	if role.Name != name || role.Desc != data.Desc {
		role.Name = name
		role.Desc = data.Desc
		err = r.role.Store(role)
		if err != nil {
			utils.JsonRespond(500, err.Error(), "", c)
			return
		}
	}
	utils.JsonRespond(200, "修改角色成功", "", c)
	return
}

func (r *RoleService) DelRole(c *gin.Context)  {
	if !r.auth.PermissionCheckMiddleware(c, "system.role.del") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}

	// 检查角色是否有用户绑定


	// 检查角色是否有权限绑定

	// 检查角色是否有应用绑定

}

func (r *RoleService) GetRolePerm(c *gin.Context)  {
	maps := make(map[string]interface{})
	maps["rid"] =  c.Param("id")
	res, err := r.rp.GetSelectRows(maps, "pid")
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}
	data := make(map[string]interface{})
	data["list"] = res
	utils.JsonRespond(200, "",data, c)
	return
}
func (r *RoleService) PostRolePerm(c *gin.Context)  {
	if !r.auth.PermissionCheckMiddleware(c, "system.role.perm") {
		utils.JsonRespond(403, "请求资源被拒绝", "", c)
		return
	}
	var data  RolePermResource
	err := c.BindJSON(&data)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	maps 		:= make(map[string]interface{})
	maps["rid"] = c.Param("id")
	oldRolePerm, err := r.rp.GetRows(maps)
	if err != nil {
		utils.JsonRespond(500, err.Error(), "", c)
		return
	}

	rid64,_ 	:= utils.S.Int64(utils.S(c.Param("id")))
	menuTempRds	:= make(map[int64]interface{})
	rolePerm	:= make(map[int64]interface{})
	newRolePerm	:= make(map[int64]interface{})

	delete(maps, "rid")
	maps["type"] = repo.MenuPermTypeMap["menu"]
	perms, err := r.perm.GetRows(maps)
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
		newRolePerm[v] = v
	}

	// 删除
	for _, k := range oldRolePerm {
		rolePerm[k.Pid] = k.Pid
		if _, ok  := newRolePerm[k.Pid]; !ok {
			// 执行删除操作
			err = r.rp.DeleteByPid(k.Pid)
			if err != nil {
				utils.JsonRespond(500, err.Error(), "", c)
				return
			}
		}
	}

	// 新增
	for k,_ := range newRolePerm {
		if _, ok  := rolePerm[k]; !ok {
			// todo
			//执行新增操作，换成批量插入更好
			rpr := &repo.RolePermRel{
				Pid: k,
				Rid: rid64}
			err = r.rp.Store(rpr)
			if err != nil {
				utils.JsonRespond(500, err.Error(), "", c)
				return
			}
		}
	}

	//更新redis里面的角色前缀的权限集合
	key := db.RoleMenuListKey
	key =  key + c.Param("id")
	fmt.Println(key)
	iter := r.rds.Scan(0, key+ "*", 0).Iterator()
	for iter.Next() {
		r.rds.Del(iter.Val())
	}

	// 再添加角色的权限
	r.perm.SetRolePermToSet(key, rid64)

	utils.JsonRespond(200, "跟新角色功能权限成功！","", c)
}