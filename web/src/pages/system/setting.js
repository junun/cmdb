import React from 'react';
import { Menu } from 'antd';
import {connect} from "dva";
import BasicSetting from './BasicSetting';
import EmailSetting from './EmailSetting';
import LDAPSetting from './LDAPSetting';
import KeySetting from './KeySetting';
import About from './About';
import styles from './index.module.css';

@connect(({ loading, system }) => {
    return {
      settingList: system.settingList,
      settingListLoading: loading.effects['system/getSetting'],
    }
 })

class SettingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: ['basic'],
      settings: {},
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ 
      type: 'system/getSetting'
    }).then(()=> {
      if (this.props.settingList.length > 0) {
        let tmp = {};
        for (let item of this.props.settingList) {
          tmp[item.name] =  item;
        }
        this.setState({
          settings: tmp,
        });
      }
    });
  }

  render() {
    const {selectedKeys} = this.state;
    return (
      <div auth="system.setting.view" className={styles.container} >
        <div className={styles.left}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            style={{border: 'none'}}
            onSelect={({selectedKeys}) => this.setState({selectedKeys})}>
            <Menu.Item key="basic">基本设置</Menu.Item>
            <Menu.Item key="ldap">LDAP设置</Menu.Item>
            <Menu.Item key="key">密钥设置</Menu.Item>
            <Menu.Item key="email">邮件服务设置</Menu.Item>
            <Menu.Item key="about">关于</Menu.Item>
          </Menu>
        </div>
        <div className={styles.right}>
          {selectedKeys[0] === 'basic' && <BasicSetting />}
          {selectedKeys[0] === 'ldap' && 
            <LDAPSetting 
              settings={this.state.settings}
              dispatch={this.props.dispatch}
            />
          }
          {selectedKeys[0] === 'key' && 
            <KeySetting
              settings={this.state.settings}
              dispatch={this.props.dispatch}
            />
          }
          {selectedKeys[0] === 'email' &&
            <EmailSetting 
              settings={this.state.settings}
              dispatch={this.props.dispatch}
            />
          }
          {selectedKeys[0] === 'about' && <About />}
        </div>
      </div>
    )
  }
}

export default SettingPage
