package repo

type AssetRoleDetail struct {
	Model
	Pid 		int64   `json:"pid"`
	Name 		string 	`json:"name" gorm:"type:varchar(128)"`
	Config 		string 	`json:"config" gorm:"type:varchar(255)"`
	Desc 		string 	`json:"desc" gorm:"type:varchar(200)"`
}

func (AssetRoleDetail) TableName() string {
	return "asset_role_detail"
}

type AssetRoleDetailRepository interface {
	GetRow(maps map[string]interface{}) (*AssetRoleDetail, error)
	GetRows(maps map[string]interface{}) ([]*AssetRoleDetail, error)
	Store(u *AssetRoleDetail) error
	Delete(id string) error
}

