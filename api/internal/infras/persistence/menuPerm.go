package persistence

import (
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/db"
	"cmdb/internal/infras/logging"
	"github.com/go-redis/redis"
	"github.com/jinzhu/gorm"
)

type menuPermRepo struct {
	db  *gorm.DB
	rds *redis.Client
}

func (m *menuPermRepo) Delete(id string) error {
	return m.db.Delete(repo.MenuPermRel{}, "id = ?", id).Error
}

func (m *menuPermRepo) Store(pom *repo.MenuPermRel) error {
	return m.db.Save(&pom).Error
}

func (m *menuPermRepo) GetRowCount(maps, vagues map[string]interface{}, isSubMenu bool) (int, error) {
	var count int
	queryCommand := m.db.Model(&repo.MenuPermRel{}).Where(maps)
	for k,v := range vagues {
		queryCommand = queryCommand.Where(k + " like ?", "%" + v.(string) + "%" )
	}
	if isSubMenu {
		err := queryCommand.
			Where("pid > ?", 0).
			Count(&count).Error
		return count, err
	}
	err := queryCommand.Count(&count).Error
	return count, err
}

func (m *menuPermRepo) GetRows(maps map[string]interface{}) ([]*repo.MenuPermRel, error) {
	var menu []*repo.MenuPermRel
	err := m.db.Where(maps).Find(&menu).Error
	return menu, err
}

func (m *menuPermRepo) GetRow(maps map[string]interface{}) (*repo.MenuPermRel, error) {
	var menu repo.MenuPermRel
	err := m.db.Where(maps).First(&menu).Error
	return &menu, err
}

func (m *menuPermRepo) GetMenu()  ([]*repo.MenuPermRel, error){
	var res []*repo.MenuPermRel
	err := m.db.Where("type=?", repo.MenuPermTypeMap["menu"]).Find(&res).Error
	return  res, err
}

func (m *menuPermRepo) GetMenuOrPerm(maps,vagues map[string]interface{},isSubMenu bool, page, pageSize int) ([]*repo.MenuPermRel, error) {
	var res []*repo.MenuPermRel
	queryCommand := m.db.Where(maps)
	for k,v := range vagues {
		queryCommand = queryCommand.Where(k + " like ?", "%" + v.(string) + "%" )
	}
	if isSubMenu {
		err := queryCommand.
			Where("pid > ?", 0).
			Offset(page).Limit(pageSize).
			Find(&res).Error
		return res, err
	}
	err := queryCommand.
		Offset(page).Limit(pageSize).
		Find(&res).Error
	return res, err
}

func (m *menuPermRepo) GetRoleMenuPid(rid int64)  ([]int64, error){
	var pid []int64
	err := m.db.Table("menu_perm_rel").
		Select("menu_perm_rel.pid").
		Joins("left join role_perm_rel on menu_perm_rel.id = role_perm_rel.pid").
		Where("role_perm_rel.rid = ?", rid).
		Pluck("DISTINCT menu_perm_rel.pid", &pid).Error
	return  pid, err
}

func (m *menuPermRepo) GetUserMenuPid(uid int64)  ([]int64, error){
	var pid []int64
	err := m.db.Table("menu_perm_rel").
		Select("menu_perm_rel.pid").
		Joins("left join user_perm_rel on menu_perm_rel.id = user_perm_rel.pid").
		Where("user_perm_rel.uid = ?", uid).
		Pluck("DISTINCT menu_perm_rel.pid", &pid).Error
	return  pid, err
}

func (m *menuPermRepo) ReturnPermissions(u repo.SystemUser) []string {
	var res []string

	if u.IsSupper != 1 {
		rows, err := m.db.Table("menu_perm_rel").
			Select("menu_perm_rel.perm").
			Joins("left join role_perm_rel on menu_perm_rel.id = role_perm_rel.pid").
			Where("role_perm_rel.rid = ?", u.Rid).
			Rows()

		if err != nil {
			logging.Error(err)
		}

		for rows.Next() {
			var name string
			if e := rows.Scan(&name); e != nil {
				logging.Error(err)
			}
			res = append(res, name)
		}
	}
	return res
}

func  (m *menuPermRepo) SetRolePermToSet(key string, rid int64) {
	var mps []repo.MenuPermRel

	m.db.Table("menu_perm_rel").
		Select("menu_perm_rel.perm").
		Joins("left join role_perm_rel on menu_perm_rel.id = role_perm_rel.pid").
		Where("role_perm_rel.rid = ?", rid).
		Find(&mps)

	for _, v := range mps {
		e := db.SetValBySetKey(m.rds, key, v.Perm)
		if e != nil {
			logging.Error(e)
		}
	}
}

func (m *menuPermRepo) SetUserPermToSet(key string, rid int64) {
	var mps []repo.MenuPermRel

	m.db.Table("menu_perm_rel").
		Select("menu_perm_rel.perm").
		Joins("left join role_perm_rel on menu_perm_rel.id = role_perm_rel.pid").
		Where("role_perm_rel.rid = ?", rid).
		Find(&mps)

	for _, v := range mps {
		e := db.SetValBySetKey(m.rds, key, v.Perm)
		if e != nil {
			logging.Error(e)
		}
	}
}

func NewMenuPermRelRepository(db *gorm.DB, rds *redis.Client) repo.MenuPermRelRepository {
	return &menuPermRepo {db:db, rds:rds}
}
