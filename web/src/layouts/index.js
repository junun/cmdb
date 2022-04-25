import React, { Component } from 'react';
import { FileSyncOutlined } from '@ant-design/icons';
import { Layout, ConfigProvider, Modal } from 'antd';
import UserLayout from './UserLayout';
import Redirect from 'umi/redirect';
import zhCN from 'antd/lib/locale-provider/zh_CN'
import SiderMenu from '@/components/SiderMenu'
import GlobalHeader from '@/components/GlobalHeader'
import GlobalFooter from '@/components/GlobalFooter'
import getPageTitle from '@/utils/getPageTitle'
import {connect} from "dva";

const { Sider, Content } = Layout;

@connect(( { loading, system } ) => {
  return {
    menu: system.menu,
    user: system.user,
    notifies: system.notifies,
    loadingMenu: loading.effects['system/getPerm'],
  };
})

class BasicLayout extends Component {
  state = {
    loading: true,
    // notifies: [],
    read: []
  };

  fetch = () => {
    const { dispatch } = this.props;
    this.setState({loading: true});
    dispatch({
      type: 'system/getNotify'
    }).then(() => this.setState({read: []}))
      .finally(() => this.setState({loading: false}))
  };

  handleRead = (e, item) => {
    e.stopPropagation();
    if (this.state.read.indexOf(item.id) === -1) {
      this.state.read.push(item.id);
      this.setState({read: this.state.read});
      const { dispatch } = this.props;
      dispatch({
        type: 'system/patchNotify',
        payload: {ids: item.id.toString()},
      })
    }
  };

  handleReadAll = () => {
    const ids = this.props.notifies.map(x => x.id);
    this.setState({read: ids});
    const { dispatch } = this.props;
    dispatch({
      type: 'system/patchNotify',
      payload: {ids: ids.join(",")},
    })
  };

  menuClick = ({ key }) => {
    const { dispatch } = this.props;
    if (key === 'logout') {
      Modal.confirm({
        title: '确定要退出吗？',
        onOk() {
          dispatch({
            type: 'system/logout'
          });
        },
      });
    }
  };

  menuDidMount = () => {
    this.props.dispatch({
      type: 'system/getRoleMenu',
    });

    // this.fetch();
    // Todo
    // this.interval = setInterval(this.fetch, 60000)
  };

  render() {
    const {read, loading} = this.state;
    const {notifies, menu, user, loadingMenu, location: { pathname } } = this.props;
    if (pathname === '/user/login') {
      return <UserLayout></UserLayout>
    }
    if (pathname === '/') {
      console.log(menu)
      if (menu && menu.length > 0) {
        return <Redirect to={menu[0].children[0].url} />;
      }
    }
    return (
      <ConfigProvider locale={zhCN}>
        <Layout>
          <Sider width={256} style={{ minHeight: '100vh', color: 'white' }} collapsible>
            <div style={{ height: '32px', background: 'rgba(225,225,225,.2)', margin: '16px', textAlign: 'center', padding: '5px',overflow: 'hidden' }}>
              <FileSyncOutlined style={{fontSize: '18px'}} />&nbsp;&nbsp;
              <span style={{fontSize: '16px', }}>IT资产管理平台</span>
            </div>
            <SiderMenu menuData={menu}
                       didMount={this.menuDidMount}
                       loading={loadingMenu}
                       pathname={pathname}/>
          </Sider>
          <Layout>
            <GlobalHeader title={getPageTitle(pathname, menu)}
                          user={user}
                          onMenuClick={this.menuClick}
                          loading={loading}
                          notifies={notifies}
                          read={read}
                          handleReadAll={this.handleReadAll}
                          handleRead={this.handleRead}/>
            <Content style={{ margin: '24px 16px 0' }}>
              <div style={{ minHeight: 360 }}>
                {this.props.children}
              </div>
            </Content>
            <GlobalFooter copyright="Copyright © 2022 IT资产管理平台" />
          </Layout>
        </Layout>
      </ConfigProvider>
    );
  }
}

export default BasicLayout;
