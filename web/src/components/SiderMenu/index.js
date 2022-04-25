import React from 'react';
import { Icon as LegacyIcon } from '@ant-design/compatible';
import { Menu, Spin, Empty} from 'antd';
import Link from 'umi/link';

const SubMenu = Menu.SubMenu;

class SiderMenu extends React.Component {
  componentDidMount() {
    this.props.didMount();
  }

  state = {
    // current: 1,
    // theme: "dark",
    collapsed: true,
    openKeys: ['']
  };

  // handleTheme = e => {
  //   console.log('click ', e);
  //   this.setState({
  //     theme: e.key,
  //   });
  // };

  // handleClick = e => {
  //   console.log('click ', e.key);
  //   this.setState({
  //     current: e.key,
  //   });
  // };

  onOpenChange = openKeys => {
    this.setState({
      openKeys
    })
  };

  render() {
    const {menuData, pathname, loading} = this.props;
    if (loading) {
      return (
        <div style={{width: '100%', textAlign: 'center'}}><Spin/></div>
      );
    }
    if (!menuData || menuData.length === 0) {
      return <Empty />;
    }
    let menuKey;
    const menu = menuData.map(x => {
        if (x.children) {
          const items = x.children.map(item => {
            if (!menuKey) {
              if (pathname !== '/') {
                if (pathname === item.url) {
                  menuKey = item.id;
                }
              }
            }

            return (
              <Menu.Item key={item.id}>
                  <Link to={item.url}>
                    <LegacyIcon type={item.icon} />{item.name}
                  </Link>
                </Menu.Item>
            );
          });
          return (
            <SubMenu key={x.id} title={<span><LegacyIcon type={x.icon} /><span>{x.name}</span></span>}>
              {items}
            </SubMenu>
          );
        } 
    });

    return (
      <div>
        <Menu theme="dark"
              mode="inline"
              openKeys={this.state.openKeys}
              onOpenChange={this.onOpenChange}
              inlineCollapsed={this.state.collapsed}
              // onClick={this.handleClick}
              // selectedKeys={[this.state.current]}
        >
          {menu}
        </Menu>
      </div>
    );
  }
}

export default SiderMenu;
