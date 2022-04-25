package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/jinzhu/gorm"
)

type assetRoleRepo struct {
	db  *gorm.DB
}

func (a assetRoleRepo) GetRow(maps map[string]interface{}) (*repo.AssetRole, error) {
	var role repo.AssetRole
	err := a.db.Where(maps).First(&role).Error
	return &role, err
}

func (a assetRoleRepo) GetRows(maps map[string]interface{}) ([]*repo.AssetRole, error) {
	var roles []*repo.AssetRole
	err := a.db.Where(maps).Find(&roles).Error
	return roles, err
}

func (a assetRoleRepo) Store(u *repo.AssetRole) error {
	return a.db.Save(&u).Error
}

func (a assetRoleRepo) Delete(id string) error {
	return a.db.Delete(repo.AssetRole{}, "id = ?", id).Error
}

func NewAssetRoleRepository(db *gorm.DB) repo.AssetRoleRepository {
	return &assetRoleRepo{db:db}
}