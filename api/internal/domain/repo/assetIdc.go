package repo

type AssetIdc struct {
	Model
	Name 		string 	`json:"name" gorm:"type:varchar(128)"`
	Address 	string 	`json:"address" gorm:"type:varchar(200)"`
	Contact 	string 	`json:"contact" gorm:"type:varchar(32)"`
	Mobile 		string  `json:"mobile" gorm:"type:varchar(32)"`
	Network 	string 	`json:"network" gorm:"type:varchar(128)"`
	Desc 		string 	`json:"desc" gorm:"type:varchar(200)"`
}

func (AssetIdc) TableName() string {
	return "asset_idc"
}

type AssetIdcRepository interface {
	GetRow(maps map[string]interface{}) (*AssetIdc, error)
	GetRows(maps map[string]interface{}) ([]*AssetIdc, error)
	Store(u *AssetIdc) error
	Delete(id string) error
}
