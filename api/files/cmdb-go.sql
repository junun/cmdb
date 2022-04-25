/*
 Navicat Premium Data Transfer

 Source Server         : 10.9.68.200
 Source Server Type    : MySQL
 Source Server Version : 50733
 Source Host           : localhost:3306
 Source Schema         : cmdb-go

 Target Server Type    : MySQL
 Target Server Version : 50733
 File Encoding         : 65001

 Date: 25/04/2022 15:03:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for asset_asset
-- ----------------------------
DROP TABLE IF EXISTS `asset_asset`;
CREATE TABLE `asset_asset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '' COMMENT '设备编号',
  `user_name` varchar(128) NOT NULL,
  `rid` int(11) NOT NULL DEFAULT '0' COMMENT '设备类型id',
  `did` int(11) NOT NULL DEFAULT '0' COMMENT '数据中心id',
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `channel` varchar(128) NOT NULL DEFAULT '',
  `mac` varchar(64) NOT NULL,
  `sn` varchar(64) NOT NULL DEFAULT '',
  `price` int(11) NOT NULL DEFAULT '22',
  `warranty` int(11) NOT NULL,
  `buy_date` varchar(32) NOT NULL DEFAULT '0',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='资产表';

-- ----------------------------
-- Table structure for asset_idc
-- ----------------------------
DROP TABLE IF EXISTS `asset_idc`;
CREATE TABLE `asset_idc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `address` varchar(200) NOT NULL,
  `contact` varchar(32) NOT NULL COMMENT ' 联系人',
  `mobile` varchar(32) NOT NULL COMMENT '手机号',
  `network` varchar(128) NOT NULL COMMENT '网段',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='数据中心表';

-- ----------------------------
-- Records of asset_idc
-- ----------------------------
BEGIN;
INSERT INTO `asset_idc` VALUES (1, 'szoffice', '新桥', 'len', '15818888888', '10.9.68.0/24,19.9.19.0/24', 'qa和dev环境', '2021-11-08 01:01:53', '2021-11-08 01:06:35');
COMMIT;

-- ----------------------------
-- Table structure for asset_role
-- ----------------------------
DROP TABLE IF EXISTS `asset_role`;
CREATE TABLE `asset_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL DEFAULT '',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='资产类型';

-- ----------------------------
-- Records of asset_role
-- ----------------------------
BEGIN;
INSERT INTO `asset_role` VALUES (1, '台式机', '台式机', '2022-03-19 16:37:33', '2022-03-19 16:37:33');
INSERT INTO `asset_role` VALUES (2, '笔记本', '笔记本', '2022-03-19 16:37:42', '2022-03-19 16:37:42');
INSERT INTO `asset_role` VALUES (3, '显示器', '显示器', '2022-03-19 16:37:52', '2022-03-19 16:37:52');
COMMIT;

-- ----------------------------
-- Table structure for asset_role_detail
-- ----------------------------
DROP TABLE IF EXISTS `asset_role_detail`;
CREATE TABLE `asset_role_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(11) NOT NULL,
  `name` varchar(64) NOT NULL DEFAULT '',
  `config` varchar(255) NOT NULL COMMENT '配置信息',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '说明',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='资产类型详情';


-- ----------------------------
-- Table structure for menu_perm_rel
-- ----------------------------
DROP TABLE IF EXISTS `menu_perm_rel`;
CREATE TABLE `menu_perm_rel` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL DEFAULT '' COMMENT '权限名',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '父级id',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1:菜单项 2: 权限项',
  `perm` varchar(120) NOT NULL DEFAULT '' COMMENT '权限项唯一标识',
  `url` varchar(120) NOT NULL DEFAULT '' COMMENT '菜单url',
  `icon` varchar(50) NOT NULL DEFAULT '' COMMENT '菜单图标',
  `desc` varchar(128) NOT NULL DEFAULT '' COMMENT '简介',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of menu_perm_rel
-- ----------------------------
BEGIN;
INSERT INTO `menu_perm_rel` VALUES (1, '系统管理', 0, 1, '', '', 'setting', '');
INSERT INTO `menu_perm_rel` VALUES (2, '资产管理', 0, 1, '', '', 'desktop', '');
INSERT INTO `menu_perm_rel` VALUES (3, '用户列表', 1, 1, '', '/system/user', 'team', '用户列表');
INSERT INTO `menu_perm_rel` VALUES (4, '角色列表', 1, 1, '', '/system/role', 'lock', '角色列表。');
INSERT INTO `menu_perm_rel` VALUES (5, '权限列表', 1, 1, '', '/system/perm', 'security-scan', '权限列表');
INSERT INTO `menu_perm_rel` VALUES (6, '一级菜单', 1, 1, '', '/system/menu', 'tag', '一级菜单');
INSERT INTO `menu_perm_rel` VALUES (7, '二级菜单', 1, 1, '', '/system/submenu', 'tags', '二级菜单');
INSERT INTO `menu_perm_rel` VALUES (8, '系统设置', 1, 1, '', '/system/setting', 'key', '系统设置');
INSERT INTO `menu_perm_rel` VALUES (9, '数据中心', 2, 1, '', '/asset/dc', 'home', '数据中心');
INSERT INTO `menu_perm_rel` VALUES (10, '资产类型', 2, 1, '', '/asset/role', 'windows', '主机类型');
INSERT INTO `menu_perm_rel` VALUES (11, '资产型号', 2, 1, '', '/asset/roleDetail', 'flag', '资产型号');
INSERT INTO `menu_perm_rel` VALUES (12, '资产列表', 2, 1, '', '/asset/asset', 'cloud-server', '资产列表');
INSERT INTO `menu_perm_rel` VALUES (13, '用户列表', 3, 2, 'system.user.list', '', '', '用户列表');
INSERT INTO `menu_perm_rel` VALUES (14, '用户添加', 3, 2, 'system.user.add', '', '', '添加用户');
INSERT INTO `menu_perm_rel` VALUES (15, '用户修改', 3, 2, 'system.user.edit', '', '', '用户修改');
INSERT INTO `menu_perm_rel` VALUES (16, '用户删除', 3, 2, 'system.user.del', '', '', '用户删除');
INSERT INTO `menu_perm_rel` VALUES (17, '角色列表', 4, 2, 'system.role.list', '', '', '角色列表');
INSERT INTO `menu_perm_rel` VALUES (18, '角色添加', 4, 2, 'system.role.add', '', '', '角色添加');
INSERT INTO `menu_perm_rel` VALUES (19, '角色编辑', 4, 2, 'system.role.edit', '', '', '角色编辑');
INSERT INTO `menu_perm_rel` VALUES (20, '角色删除', 4, 2, 'system.role.del', '', '', '角色删除');
INSERT INTO `menu_perm_rel` VALUES (21, '角色权限项查看', 4, 2, 'role-perm-list', '', '', '角色权限项查看');
INSERT INTO `menu_perm_rel` VALUES (22, '角色权限项添加', 4, 2, 'system.role.perm', '', '', '角色权限项添加');
INSERT INTO `menu_perm_rel` VALUES (23, '权限项删除', 5, 2, 'system.perm.del', '', '', '权限项删除');
INSERT INTO `menu_perm_rel` VALUES (24, '权限项添加', 5, 2, 'system.perm.add', '', '', '权限项添加');
INSERT INTO `menu_perm_rel` VALUES (25, '权限项修改', 5, 2, 'system.perm.edit', '', '', '权限项修改');
INSERT INTO `menu_perm_rel` VALUES (26, '一级菜单列表', 6, 2, 'system.menu.list', '', '', '一级菜单列表');
INSERT INTO `menu_perm_rel` VALUES (27, '一级菜单添加', 6, 2, 'system.menu.add', '', '', '一级菜单添加');
INSERT INTO `menu_perm_rel` VALUES (28, '一级菜单修改', 6, 2, 'system.menu.edit', '', '', '一级菜单修改');
INSERT INTO `menu_perm_rel` VALUES (29, '一级菜单删除', 6, 2, 'system.menu.del', '', '', '一级菜单删除');
INSERT INTO `menu_perm_rel` VALUES (30, '二级菜单列表', 7, 2, 'system.submenu.list', '', '', '二级菜单列表页');
INSERT INTO `menu_perm_rel` VALUES (31, '二级菜单添加', 7, 2, 'system.submenu.ladd', '', '', '二级菜单添加');
INSERT INTO `menu_perm_rel` VALUES (32, '二级菜单修改', 7, 2, 'system.submenu.ledit', '', '', '二级菜单添加');
INSERT INTO `menu_perm_rel` VALUES (33, '二级菜单删除', 7, 2, 'system.submenu.ldel', '', '', '二级菜单删除');
INSERT INTO `menu_perm_rel` VALUES (34, '系统设置', 8, 2, 'system.setting.edit', '', '', '系统设置页面保存');
INSERT INTO `menu_perm_rel` VALUES (35, '邮件测试', 8, 2, 'system.email.test', '', '', '系统设置邮件测试');
INSERT INTO `menu_perm_rel` VALUES (36, 'LDAP测试', 8, 2, 'system.ldap.test', '', '', 'LDAP测试');
INSERT INTO `menu_perm_rel` VALUES (37, 'DC列表', 9, 2, 'asset.dc.list', '', '', 'DC列表');
INSERT INTO `menu_perm_rel` VALUES (38, '新增DC', 9, 2, 'asset.dc.add', '', '', '新增DC');
INSERT INTO `menu_perm_rel` VALUES (39, 'DC修改', 9, 2, 'asset.dc.edit', '', '', 'DC修改');
INSERT INTO `menu_perm_rel` VALUES (40, 'DC删除', 9, 2, 'asset.dc.del', '', '', 'DC删除');
INSERT INTO `menu_perm_rel` VALUES (41, '资产类型列表', 10, 2, 'asset.role.list', '', '', '资产类型列表');
INSERT INTO `menu_perm_rel` VALUES (42, '资产类型添加', 10, 2, 'asset.role.add', '', '', '资产类型添加');
INSERT INTO `menu_perm_rel` VALUES (43, '资产类型修改', 10, 2, 'asset.role.edit', '', '', '资产类型修改');
INSERT INTO `menu_perm_rel` VALUES (44, '资产类型删除', 10, 2, 'asset.role.del', '', '', '资产类型删除');
INSERT INTO `menu_perm_rel` VALUES (45, '资产型号列表', 11, 2, 'asset.roleDetail.list', '', '', '资产型号列表');
INSERT INTO `menu_perm_rel` VALUES (46, '资产型号添加', 11, 2, 'asset.roleDetail.add', '', '', '资产型号添加');
INSERT INTO `menu_perm_rel` VALUES (47, '资产型号编辑', 11, 2, 'asset.roleDetail.edit', '', '', '资产型号编辑');
INSERT INTO `menu_perm_rel` VALUES (48, '资产型号删除', 11, 2, 'asset.roleDetail.del', '', '', '资产型号删除');
INSERT INTO `menu_perm_rel` VALUES (49, '资产列表', 12, 2, 'asset.asset.list', '', '', '资产列表');
INSERT INTO `menu_perm_rel` VALUES (50, '资产添加', 12, 2, 'asset.asset.add', '', '', '资产添加');
INSERT INTO `menu_perm_rel` VALUES (51, '资产修改', 12, 2, 'asset.asset.edit', '', '', '资产修改');
INSERT INTO `menu_perm_rel` VALUES (52, '资产导入', 12, 2, 'asset.asset.import', '', '', '资产导入');
INSERT INTO `menu_perm_rel` VALUES (53, '资产删除', 12, 2, 'asset.asset.del', '', '', '资产删除');
COMMIT;

-- ----------------------------
-- Table structure for notify
-- ----------------------------
DROP TABLE IF EXISTS `notify`;
CREATE TABLE `notify` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT '' COMMENT '通知标题',
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1：通知， 2：代办',
  `source` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1：monitor 监控中心， 2：schedule 任务计划',
  `content` varchar(255) NOT NULL DEFAULT '' COMMENT '通知内容',
  `unread` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0：已经查看处理， 1：未处理',
  `link` varchar(128) NOT NULL DEFAULT '' COMMENT '通知附加链接',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='通知信息表';

-- ----------------------------
-- Records of notify
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for role_perm_rel
-- ----------------------------
DROP TABLE IF EXISTS `role_perm_rel`;
CREATE TABLE `role_perm_rel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rid` int(11) NOT NULL DEFAULT '0' COMMENT '角色id',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '权限id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of role_perm_rel
-- ----------------------------
BEGIN;
INSERT INTO `role_perm_rel` VALUES (1, 1, 17);
INSERT INTO `role_perm_rel` VALUES (2, 1, 21);
INSERT INTO `role_perm_rel` VALUES (3, 1, 37);
INSERT INTO `role_perm_rel` VALUES (4, 1, 41);
INSERT INTO `role_perm_rel` VALUES (5, 1, 45);
INSERT INTO `role_perm_rel` VALUES (6, 1, 49);
COMMIT;

-- ----------------------------
-- Table structure for system_role
-- ----------------------------
DROP TABLE IF EXISTS `system_role`;
CREATE TABLE `system_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '角色名',
  `desc` varchar(255) NOT NULL DEFAULT '' COMMENT '角色介绍',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='角色表';

-- ----------------------------
-- Records of system_role
-- ----------------------------
BEGIN;
INSERT INTO `system_role` VALUES (1, 'ldap', 'ldap默认组');
INSERT INTO `system_role` VALUES (2, 'admin', '管理员组');
COMMIT;

-- ----------------------------
-- Table structure for system_setting
-- ----------------------------
DROP TABLE IF EXISTS `system_setting`;
CREATE TABLE `system_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `value` varchar(2048) NOT NULL DEFAULT '',
  `desc` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `key` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of system_setting
-- ----------------------------
BEGIN;
INSERT INTO `system_setting` VALUES (1, 'mail_service', '{\"server\":\"smtp.qq.com\",\"port\":\"465\",\"username\":\"123456@qq.com\",\"password\":\"xxxxxxxxx\",\"nickname\":\"123456@qq.com\"}', '');
INSERT INTO `system_setting` VALUES (2, 'ldap_service', '{\"add\":\"10.9.12.51\",\"port\":\"389\",\"searchDn\":\"xx-ldap\",\"searchPwd\":\"xxxxxxxxx\",\"baseDn\":\"OU=MHS,DC=mhs,DC=local\"}', '');
COMMIT;

-- ----------------------------
-- Table structure for system_user
-- ----------------------------
DROP TABLE IF EXISTS `system_user`;
CREATE TABLE `system_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` tinyint(1) NOT NULL DEFAULT '1' COMMENT '用户类型，1：平台用户， 2：LDAP用户',
  `rid` int(11) NOT NULL DEFAULT '0' COMMENT '角色id',
  `name` varchar(50) NOT NULL DEFAULT '' COMMENT '用户名',
  `nickname` varchar(50) NOT NULL DEFAULT '' COMMENT '昵称',
  `password_hash` varchar(100) NOT NULL DEFAULT '' COMMENT 'hash密码',
  `email` varchar(120) NOT NULL DEFAULT '' COMMENT '邮箱',
  `mobile` varchar(30) NOT NULL DEFAULT '' COMMENT '电话',
  `secret` varchar(128) NOT NULL DEFAULT '' COMMENT '用户共享秘钥',
  `two_factor` tinyint(1) NOT NULL COMMENT '是否启用双因子认证',
  `is_supper` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为超级用户',
  `is_active` tinyint(1) NOT NULL DEFAULT '0' COMMENT '用户是否激活',
  `access_token` varchar(120) NOT NULL DEFAULT '' COMMENT '用户token',
  `token_expired` int(11) NOT NULL DEFAULT '0' COMMENT 'token过期时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='用户表';

-- ----------------------------
-- Records of system_user
-- ----------------------------
BEGIN;
INSERT INTO `system_user` VALUES (1, 1, 0, 'admin', 'admin', '$2a$14$LHYI972tn/Y1j6x5v3hNP.UwJ/gmSpCDh5audlLLV8gQ94R6Z7dcG', '', '', '', 0, 1, 1, '', 1650955681);
COMMIT;

-- ----------------------------
-- Table structure for user_perm_rel
-- ----------------------------
DROP TABLE IF EXISTS `user_perm_rel`;
CREATE TABLE `user_perm_rel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) NOT NULL DEFAULT '0' COMMENT '用户id',
  `pid` int(11) NOT NULL DEFAULT '0' COMMENT '权限id',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of user_perm_rel
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
