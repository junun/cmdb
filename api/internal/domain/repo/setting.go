package repo


type SystemSettingRepository interface {
	GetSetting() ([]*SystemSetting, error)
	GetByName(name string) (*SystemSetting, error)
	Store(u *SystemSetting) error
}

type SystemSetting struct {
	Model
	Name 		string 	`json:"name" gorm:"type:varchar(128)"`
	Value		string 	`json:"value" gorm:"type:varchar(255)"`
	Desc 		string 	`json:"desc" gorm:"type:varchar(200)"`
}

func (SystemSetting) TableName() string {
	return "system_setting"
}