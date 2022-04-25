package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/jinzhu/gorm"
)

type roleRepo struct {
	db *gorm.DB
}

func (r *roleRepo) GetRow(maps map[string]interface{}) (*repo.SystemRole, error) {
	var role repo.SystemRole
	err := r.db.Where(maps).First(&role).Error
	return &role, err
}

func (r *roleRepo) GetRows(maps map[string]interface{}) ([]*repo.SystemRole, error) {
	var role []*repo.SystemRole
	err := r.db.Where(maps).Find(&role).Error
	return role, err
}

func (r *roleRepo) Delete(id string) error {
	return r.db.Delete(repo.SystemRole{}, "id = ?", id).Error
}

func (r *roleRepo) Store(role *repo.SystemRole) error {
	return r.db.Save(&role).Error
}

func (r *roleRepo) GetRole(maps map[string]interface{}) ([]*repo.SystemRole, error) {
	var res []*repo.SystemRole
	err := r.db.Where(maps).Find(&res).Error
	return res, err
}

func NewRoleRepository(db *gorm.DB) repo.SystemRoleRepository {
	return &roleRepo{db:db}
}