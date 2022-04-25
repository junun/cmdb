package repo

type AssetRole struct {
	Model
	Name 		string 	`json:"name" gorm:"type:varchar(128)"`
	Desc 		string 	`json:"desc" gorm:"type:varchar(200)"`
}

func (AssetRole) TableName() string {
	return "asset_role"
}

type AssetRoleRepository interface {
	GetRow(maps map[string]interface{}) (*AssetRole, error)
	GetRows(maps map[string]interface{}) ([]*AssetRole, error)
	Store(u *AssetRole) error
	Delete(id string) error
}

