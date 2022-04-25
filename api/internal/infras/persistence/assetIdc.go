package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/jinzhu/gorm"
)

type assetIdcRepo struct {
	db  *gorm.DB
}

func (a assetIdcRepo) GetRow(maps map[string]interface{}) (*repo.AssetIdc, error) {
	var idc repo.AssetIdc
	err := a.db.Where(maps).First(&idc).Error
	return &idc, err
}

func (a assetIdcRepo) GetRows(maps map[string]interface{}) ([]*repo.AssetIdc, error) {
	var idc []*repo.AssetIdc
	err := a.db.Where(maps).Find(&idc).Error
	return idc, err
}

func (a assetIdcRepo) Store(u *repo.AssetIdc) error {
	return a.db.Save(&u).Error
}

func (a assetIdcRepo) Delete(id string) error {
	return a.db.Delete(repo.AssetIdc{}, "id = ?", id).Error
}

func NewAssetIdcRepository(db *gorm.DB) repo.AssetIdcRepository {
	return &assetIdcRepo{db:db}
}
