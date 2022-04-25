import { LogoutOutlined, NotificationOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Layout, Menu, Dropdown, Avatar, Badge, List } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styles from './index.less'

const { Header } = Layout;

const GlobalHeader = ({ title, user, onMenuClick, notifies, read, loading, handleReadAll, handleRead}) => {
  const menu = (
    <Menu selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item>
        <Link to="/welcome/info">
          <UserOutlined />个人中心
        </Link>
      </Menu.Item>
      <Menu.Item disabled>
        <SettingOutlined />设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />退出登录
      </Menu.Item>
    </Menu>
  );

  const notify = (
    <Menu className={styles.notify}>
      <Menu.Item style={{padding: 0, whiteSpace: 'unset'}}>
        <List
          loading={loading}
          style={{maxHeight: 500, overflow: 'scroll'}}
          itemLayout="horizontal"
          dataSource={notifies}
          renderItem={item => (
            <List.Item className={styles.notifyItem} onClick={e => handleRead(e, item)}>
              <List.Item.Meta
                style={{opacity: read.includes(item.id) ? 0.4 : 1}}
                avatar={<NotificationOutlined style={{fontSize: 24, color: '#1890ff'}} />}
                title={<span style={{fontWeight: 400, color: '#404040'}}>{item.Title}</span>}
                description={[
                  <div key="1" style={{fontSize: 12}}>{item.Content}</div>,
                  <div key="2" style={{fontSize: 12}}>{moment(item.CreateTime).fromNow()}</div>
                ]}/>
            </List.Item>
          )} />
        {notifies.length !== 0 && (
          <div className={styles.notifyFooter} onClick={() => handleReadAll()}>全部 已读</div>
        )}
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ background: '#fff', padding: '0 20px' }}>
      <span className={styles.pageTitle}>{title}</span>
      
        <Dropdown overlay={notify} trigger={['click']}>
          <span className={styles.trigger}>
            <Badge count={notifies.length - read.length}>
              <NotificationOutlined style={{fontSize: 16}} />
            </Badge>
          </span>
        </Dropdown>

        <Dropdown overlay={menu}>
          <span className={styles.userMenu}>
            {user.headimgurl && user.headimgurl.length > 0 ?
              <Avatar size="small" src={user.headimgurl}/>
              :
              <UserOutlined />
            }
            <span>{user.Nickname}</span>
          </span>
        </Dropdown>

    </Header>
  );
};

export default GlobalHeader;
