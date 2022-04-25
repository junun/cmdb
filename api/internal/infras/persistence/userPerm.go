package persistence

import (
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/logging"
	"github.com/go-redis/redis"
	"github.com/jinzhu/gorm"
)

type userPermRepo struct {
	db  *gorm.DB
	rds *redis.Client
}

func (u1 *userPermRepo) ReturnPermissions(u repo.SystemUser) []string {
	var res []string

	rows, err := u1.db.Table("menu_perm_rel").
		Select("menu_perm_rel.perm").
		Joins("left join user_perm_rel on menu_perm_rel.id = user_perm_rel.pid").
		Where("user_perm_rel.uid = ?", u.ID).
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

	return res
}

func (u *userPermRepo) GetRow(maps map[string]interface{}) (*repo.UserPermRel, error) {
	var item repo.UserPermRel
	err := u.db.Where(maps).First(&item).Error
	return &item, err
}

func (u *userPermRepo) GetRows(maps map[string]interface{}) ([]*repo.UserPermRel, error) {
	var items []*repo.UserPermRel
	err := u.db.Where(maps).Find(&items).Error
	return items, err
}

func (u *userPermRepo) GetSelectRows(maps map[string]interface{}, selectName string) ([]*repo.UserPermRel, error) {
	var items []*repo.UserPermRel
	err := u.db.Where(maps).Select(selectName).Find(&items).Error
	return items, err
}

func (u *userPermRepo) Store(user *repo.UserPermRel) error {
	return u.db.Save(&user).Error
}

func (u *userPermRepo) Delete(id string) error {
	return u.db.Delete(repo.UserPermRel{}, "id = ?", id).Error
}

func (u *userPermRepo) DeleteByUid(uid int64) error {
	return u.db.Delete(repo.RolePermRel{}, "uid = ?", uid).Error
}

func NewUserPermRelRepository(db *gorm.DB, rds *redis.Client) repo.UserPermRelRepository {
	return &userPermRepo{db:db, rds:rds}
}

