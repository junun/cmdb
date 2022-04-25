package repo

type SystemUserRepository interface {
	EnableUser(name string) error
	ResetUser(name, password string) error
	Logout(uid int64) error
	GetUser(maps map[string]interface{}, page, pageSize int) ([]*SystemUser, error)
	Delete(id string) error
	GetRow(maps map[string]interface{}) (*SystemUser, error)
	GetRows(maps map[string]interface{}) ([]*SystemUser, error)
	GetRowCount(maps map[string]interface{}) (int, error)
	Store(u *SystemUser) error
}


// SystemUser 用户表
type SystemUser struct {
	Model
	Rid				int64   `json:"rid"`
	Type			int     `json:"type"`
	Name 			string 	`json:"name" gorm:"type:varchar(128)"`
	Nickname 		string  `json:"nickname" gorm:"type:varchar(128)"`
	PasswordHash 	string  `json:"-"`
	Email 			string  `json:"email" gorm:"type:varchar(56)"`
	Mobile 			string  `json:"mobile" gorm:"type:varchar(32)"`
	Secret 			string  `json:"secret" gorm:"type:varchar(32)"`
	TwoFactor	    int 	`json:"twoFactor"`
	IsSupper  		int		`json:"isSupper"`
	IsActive		int		`json:"isActive"`
	AccessToken 	string
	TokenExpired 	int64	`json:"tokenExpired"`
}


// TableName system_user table.
func (SystemUser) TableName() string {
	return "system_user"
}

