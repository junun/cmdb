package repo

type UserPermRel struct {
	Model
	Uid				int64  	`json:"uid"`
	Pid				int64   `json:"pid"`
}

type UserPermRelRepository interface {
	ReturnPermissions(u SystemUser) []string
	GetRow(maps map[string]interface{}) (*UserPermRel, error)
	GetRows(maps map[string]interface{}) ([]*UserPermRel, error)
	GetSelectRows(maps map[string]interface{}, selectName string) ([]*UserPermRel, error)
	Store(u *UserPermRel) error
	Delete(id string) error
	DeleteByUid(uid int64) error
}

func (UserPermRel) TableName() string {
	return "user_perm_rel"
}

