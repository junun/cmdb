package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/go-redis/redis"
	"github.com/jinzhu/gorm"
)

type rolePermRepo struct {
	db  *gorm.DB
	rds *redis.Client
}

func (r rolePermRepo) GetSelectRows(maps map[string]interface{}, selectName string) ([]*repo.RolePermRel, error) {
	var items []*repo.RolePermRel
	err := r.db.Where(maps).Select(selectName).Find(&items).Error
	return items, err
}

func (r rolePermRepo) DeleteByPid(pid int64) error {
	return r.db.Delete(repo.RolePermRel{}, "pid = ?", pid).Error
}

func (r rolePermRepo) GetRow(maps map[string]interface{}) (*repo.RolePermRel, error) {
	var item repo.RolePermRel
	err := r.db.Where(maps).First(&item).Error
	return &item, err
}

func (r rolePermRepo) GetRows(maps map[string]interface{}) ([]*repo.RolePermRel, error) {
	var items []*repo.RolePermRel
	err := r.db.Where(maps).Find(&items).Error
	return items, err
}

func (r rolePermRepo) Store(item *repo.RolePermRel) error {
	return r.db.Save(&item).Error
}

func (r rolePermRepo) Delete(id string) error {
	return r.db.Delete(repo.RolePermRel{}, "id = ?", id).Error
}

func NewRolePermRelRepository(db *gorm.DB, rds *redis.Client) repo.RolePermRelRepository {
	return &rolePermRepo{db:db, rds:rds}
}
