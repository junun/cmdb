package repo

type SystemRole struct {
	Model
	Name 		string 	`json:"name" gorm:"type:varchar(128)"`
	Desc 		string 	`json:"desc" gorm:"type:varchar(200)"`
}

func (SystemRole) TableName() string {
	return "system_role"
}

type SystemRoleRepository interface {
	GetRole(maps map[string]interface{}) ([]*SystemRole, error)
	GetRow(maps map[string]interface{}) (*SystemRole, error)
	GetRows(maps map[string]interface{}) ([]*SystemRole, error)
	Store(u *SystemRole) error
	Delete(id string) error
}
