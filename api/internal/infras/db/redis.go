package db

import (
	"github.com/go-redis/redis"
	"time"
)

const (
	EmailSendQueue  	= "email_send_queue"
	DingTalkSendQueue  	= "ding_talk_send_queue"
	CronNameEntryId 	= "cron_name_entry_id"
	RedisScanCount		= 100

	// all perms key
	AllPermsKey 	= "all_perms_key"

	// redis 角色菜单 key 前缀
	RoleMenuListKey 	= "role_menu_list_"
	//RoleUserMenuListKey 	= "role_user_menu_list_"

	// redis 角色菜单 key 前缀
	UserMenuListKey 	= "user_menu_list_"

	// redis 角色权限 key 前缀
	RoleRermSetKey 	= "role_perms_set_"
)
type RedisConn struct {
	Addr        string
	Password    string
	DB			int
}

type SentinelConn struct {
	MasterName 	string
	SentinelNodes []string
	Password 	string
	DB 			int
	Client 		*redis.Client
}

type ClusterConn struct {
	StartNodes []string
	Password 	string
	DB 			int
}

func  (r *RedisConn) ConnectDB() *redis.Client {
	var rdb *redis.Client
	rdb = redis.NewClient(&redis.Options{
		Addr: r.Addr,
		Password: r.Password,
		DB: r.DB,
	})

	return rdb
}

func GetQueueLength(rdb *redis.Client, name string) int64{
	res, _ 	:= rdb.Exists(name).Result()
	if res == 0 {
		return 0
	}
	len,e:= rdb.LLen(name).Result()
	if e != nil{
		return 0
	}

	return len
}

func DelKey(rdb *redis.Client, key string) {
	rdb.Del(key).Val()
}

func GetValByKey(rdb *redis.Client, key string) interface{} {
	return  rdb.Get(key).Val()
}

func SetValByKey(rdb *redis.Client, key string, val interface{}, expiration time.Duration) error{
	_, err :=rdb.Set(key, val, expiration).Result()

	return  err
}

func SetValBySetKey(rdb *redis.Client, key string, val interface{}) error{
	_, err := rdb.SAdd(key, val).Result()

	return  err
}

func CheckMemberByKey(rdb *redis.Client, key string, val interface{}) bool{
	isMember, _ := rdb.SIsMember(key, val).Result()
	return isMember
}