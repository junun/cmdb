package repo

type RolePermRel struct {
	Model
	Rid				int64  	`json:"rid"`
	Pid				int64   `json:"pid"`
}

type RolePermRelRepository interface {
	GetRow(maps map[string]interface{}) (*RolePermRel, error)
	GetRows(maps map[string]interface{}) ([]*RolePermRel, error)
	GetSelectRows(maps map[string]interface{}, selectName string) ([]*RolePermRel, error)
	Store(u *RolePermRel) error
	Delete(id string) error
	DeleteByPid(pid int64) error
}

func (RolePermRel) TableName() string {
	return "role_perm_rel"
}
