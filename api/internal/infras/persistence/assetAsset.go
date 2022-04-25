package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/jinzhu/gorm"
)

type assetAssetRepo struct {
	db  *gorm.DB
}

func (a assetAssetRepo) GetVagueRows(maps, vagues map[string]interface{}) ([]*repo.AssetAsset, error) {
	var items []*repo.AssetAsset
	queryCommand := a.db.Where(maps)
	for k,v := range vagues {
		queryCommand = queryCommand.Where(k + " like ?", "%" + v.(string) + "%" )
	}
	err := queryCommand.Find(&items).Error
	return items, err
}

func (a assetAssetRepo) GetRow(maps map[string]interface{}) (*repo.AssetAsset, error) {
	var item repo.AssetAsset
	err := a.db.Where(maps).First(&item).Error
	return &item, err
}

func (a assetAssetRepo) GetRows(maps map[string]interface{}) ([]*repo.AssetAsset, error) {
	var items []*repo.AssetAsset
	err := a.db.Where(maps).Find(&items).Error
	return items, err
}

func (a assetAssetRepo) Store(u *repo.AssetAsset) error {
	return a.db.Save(&u).Error
}

func (a assetAssetRepo) Delete(id string) error {
	return a.db.Delete(repo.AssetAsset{}, "id = ?", id).Error
}

func NewAssetAssetRepository(db *gorm.DB) repo.AssetAssetRepository {
	return &assetAssetRepo{db:db}
}