package main

import (
	"cmdb/internal/config"
	"cmdb/internal/domain/repo"
	"cmdb/internal/infras/utils"
	"flag"
	"fmt"
	"github.com/jinzhu/gorm"
	"log"
	"os"
)

var (
	h bool
	c string
	Passwd string
	Check string
	DB *gorm.DB
)

type ManagerService struct {
	repo   repo.SystemUserRepository
}

func NewManagerService(userRepo repo.SystemUserRepository) *ManagerService {
	return &ManagerService{repo:userRepo}
}

func init() {
	flag.BoolVar(&h, "h", false, "this help")

	flag.StringVar(&c, "c", "", "create_admin : 创建管理员账户, enable_admin : 启用管理员账户")

	// 改变默认的 Usage
	flag.Usage = usage
	config.CfgFile = "../app.yaml"
	viperEntry, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("read config error:%s\n", err.Error())
	}
	DB, _ = config.InitDBConf(viperEntry)
}

func usage() {
	fmt.Fprintf(os.Stderr, `
Usage: progarm [-h] [-c do some work] 

Options:
`)
	flag.PrintDefaults()
}

func  main() {
	flag.Parse()

	if h {
		flag.Usage()
		return
	}

	if len(os.Args) == 1 {
		flag.Usage()
		return
	}

	switch  {
	case c == "create_admin":
		CreateAdmin()

	case c == "enable_admin":
		EnableAdmin()
	default:
		flag.Usage()
	}
}

func CreateAdmin() {
	var user repo.SystemUser

	//检查 admin 用户是否存在
	err := DB.Where("name = ?", "admin").First(&user).Error
	if err == gorm.ErrRecordNotFound {
		fmt.Printf("Please enter password for admin : ")
		fmt.Scanln(&Passwd)
		// 新增用户
		user.Name 				= "admin"
		user.PasswordHash, _ 	= utils.HashPassword(Passwd)
		user.Nickname 			= "admin"
		user.IsSupper			= 1
		user.IsActive 			= 1
		user.TwoFactor			= 0

		if e := DB.Create(&user).Error; e != nil {
			panic(e)
		}
	} else {
		fmt.Printf("已存在管理员账户admin，需要重置密码[y|n]？ : ")
		fmt.Scanln(&Check)

		if Check == "y" {
			fmt.Printf("Please enter password for admin : ")
			fmt.Scanln(&Passwd)
			passwdhash, _ := utils.HashPassword(Passwd)
			e := DB.Model(&user).Update("password_hash", passwdhash).Error
			if e != nil {
				panic(e)
			}
		}
	}
}

func EnableAdmin() {
	var user repo.SystemUser
	DB.Where("name = ?", "admin").First(&user)

	user.IsActive = 1
	e := DB.Save(&user).Error

	if e != nil {
		panic(e)
	}
}
