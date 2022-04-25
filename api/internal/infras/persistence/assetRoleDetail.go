package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/jinzhu/gorm"
)

type assetRoleDetailRepo struct {
	db  *gorm.DB
}

func (a assetRoleDetailRepo) GetRow(maps map[string]interface{}) (*repo.AssetRoleDetail, error) {
	var item repo.AssetRoleDetail
	err := a.db.Where(maps).First(&item).Error
	return &item, err
}

func (a assetRoleDetailRepo) GetRows(maps map[string]interface{}) ([]*repo.AssetRoleDetail, error) {
	var items []*repo.AssetRoleDetail
	err := a.db.Where(maps).Find(&items).Error
	return items, err
}

func (a assetRoleDetailRepo) Store(u *repo.AssetRoleDetail) error {
	return a.db.Save(&u).Error
}

func (a assetRoleDetailRepo) Delete(id string) error {
	return a.db.Delete(repo.AssetRoleDetail{}, "id = ?", id).Error
}

func NewAssetRoleDetailRepository(db *gorm.DB) repo.AssetRoleDetailRepository {
	return &assetRoleDetailRepo{db:db}
}