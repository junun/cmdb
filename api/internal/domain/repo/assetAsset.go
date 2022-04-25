package repo

type AssetAsset struct {
	Model
	Rid				int64   `json:"rid"`
	Did				int64   `json:"did"`
	Status 			int     `json:"status"`
	Name      		string 	`json:"name" gorm:"type:varchar(32)"`
	UserName      	string 	`json:"userName" gorm:"type:varchar(32)"`
	Channel      	string 	`json:"channel" gorm:"type:varchar(128)"`
	Sn 				string 	`json:"sn" gorm:"type:varchar(64)"`
	Mac				string 	`json:"mac" gorm:"type:varchar(64)"`
	Price 			int 	`json:"price"`
	Warranty 		int 	`json:"warranty"`
	BuyDate			string 	`json:"buyDate" gorm:"type:varchar(32)"`
	Desc  			string 	`json:"desc" gorm:"type:varchar(200)"`
}


func (AssetAsset) TableName() string {
	return "asset_asset"
}

type AssetAssetRepository interface {
	GetVagueRows(maps, vagues map[string]interface{}) ([]*AssetAsset, error)
	GetRow(maps map[string]interface{}) (*AssetAsset, error)
	GetRows(maps map[string]interface{}) ([]*AssetAsset, error)
	Store(u *AssetAsset) error
	Delete(id string) error
}