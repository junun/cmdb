package persistence

import (
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"github.com/go-redis/redis"
	"github.com/jinzhu/gorm"
)

// user repo
type userRepo struct {
	db *gorm.DB
	rds *redis.Client
	m repo.MenuPermRelRepository
}

func (u *userRepo) GetRow(maps map[string]interface{}) (*repo.SystemUser, error) {
	var item repo.SystemUser
	err := u.db.Where(maps).First(&item).Error
	return &item, err
}

func (u *userRepo) GetRows(maps map[string]interface{}) ([]*repo.SystemUser, error) {
	var items []*repo.SystemUser
	err := u.db.Where(maps).Find(&items).Error
	return items, err
}

func (u *userRepo) GetRowCount(maps map[string]interface{}) (int, error) {
	var count int
	err := u.db.Model(&repo.SystemUser{}).Where(maps).Count(&count).Error
	return count, err
}

func (u *userRepo) ResetUser(name, password string) error {
	var item repo.SystemUser
	u.db.Where("name = ?", name).First(&item)

	passwordHash, _ := utils.HashPassword(password)
	err := u.db.Model(&item).Update("password_hash", passwordHash).Error
	if err != nil {
		return err
	}

	return nil
}

func (u *userRepo) EnableUser(name string) error {
	var item repo.SystemUser
	u.db.Where("name = ?", name).First(&item)

	item.IsActive = 1
	if err := u.db.Create(&item).Error; err != nil {
		return err
	}

	return nil
}

func (u *userRepo) Store(user *repo.SystemUser) error {
	return u.db.Save(&user).Error
}

func (u *userRepo) GetByName(name string) (*repo.SystemUser, error) {
	var user repo.SystemUser
	err := u.db.Where("name = ?", name).First(&user).Error
	return &user, err
}

func (u *userRepo) GetByToken(token string) (*repo.SystemUser, error) {
	var user repo.SystemUser
	err := u.db.Where("access_token = ?", token).First(&user).Error
	return &user, err
}


func (u *userRepo) Logout(uid int64) error {
	var user repo.SystemUser
	u.db.Find(&user, uid)
	user.AccessToken = ""
	return u.db.Save(&user).Error
}


func (u *userRepo) GetUser(maps map[string]interface{},page, pageSize int) ([]*repo.SystemUser, error) {
	var res []*repo.SystemUser

	//data := make(map[string]interface{})
	err := u.db.Where(maps).
				Where("rid > 0").
				Offset(page).Limit(pageSize).
				Find(&res).Error
	return res, err
}

func (u *userRepo) Delete(id string) error {
	return u.db.Delete(repo.SystemUser{}, "id = ?", id).Error
}

func NewUserRepository(db *gorm.DB, rds *redis.Client, permsRepo repo.MenuPermRelRepository) repo.SystemUserRepository {
	return &userRepo{db:db, rds:rds, m: permsRepo}
}