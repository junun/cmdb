package persistence

import (
	"cmdb/internal/domain/repo"
	"github.com/go-redis/redis"
	"github.com/jinzhu/gorm"
)

type SettingRepo struct {
	db *gorm.DB
	rds *redis.Client
}

func (s *SettingRepo) GetSetting() ([]*repo.SystemSetting, error) {
	var sets []*repo.SystemSetting
	err := s.db.Find(&sets).Error
	return sets, err
}

func NewSettingRepository(db *gorm.DB, rds *redis.Client) repo.SystemSettingRepository {
	return &SettingRepo{db:db, rds:rds}
}

func (s *SettingRepo) GetByName(name string) (*repo.SystemSetting, error) {
	var set repo.SystemSetting
	err := s.db.Where("name = ?", name).First(&set).Error
	return &set, err
}

func (s *SettingRepo) Store(set *repo.SystemSetting) error {
	return s.db.Save(&set).Error
}