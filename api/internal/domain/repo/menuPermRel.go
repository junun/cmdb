package repo


var MenuPermTypeMap = map[string]int{
	"menu": 1,
	"perm": 2,
}

type MenuPermRelRepository interface {
	ReturnPermissions(u SystemUser) []string
	SetRolePermToSet(key string, rid int64)
	SetUserPermToSet(key string, rid int64)
	GetMenu() ([]*MenuPermRel, error)
	GetMenuOrPerm(maps, vagues map[string]interface{}, isSubMenu bool,page, pageSize int) ([]*MenuPermRel, error)
	GetRoleMenuPid(rid int64) ([]int64, error)
	GetUserMenuPid(uid int64) ([]int64, error)
	GetRowCount(maps,vagues map[string]interface{}, isSubMenu bool) (int, error)
	GetRow(maps map[string]interface{}) (*MenuPermRel, error)
	GetRows(maps map[string]interface{}) ([]*MenuPermRel, error)
	Store(u *MenuPermRel) error
	Delete(id string) error
}

type MenuPermRel struct {
	Model
	Pid				int64   `json:"pid"`
	Name 			string 	`json:"name" gorm:"type:varchar(128)"`
	Type			int		`json:"type"`
	Perm		    string 	`json:"perm" gorm:"type:varchar(128)"`
	Url				string 	`json:"url" gorm:"type:varchar(128)"`
	Icon			string 	`json:"icon" gorm:"type:varchar(32)"`
	Desc			string 	`json:"desc" gorm:"type:varchar(255)"`
	Children    	[]*MenuPermRel `json:"children"`
}

func (MenuPermRel) TableName() string {
	return "menu_perm_rel"
}