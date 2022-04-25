import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import GlobalFooter from '@/components/GlobalFooter';
import Link from 'umi/link';
import styles from './UserLayout.less';
import logo from './logo.svg';

import { CodeOutlined, CopyrightOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';

import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';

import { Input, Button, Checkbox, Tabs } from 'antd';

@connect(({ loading }) => {
  return {
    loading: loading.global,
  }
})

class UserLayout extends Component {
  componentDidMount() {
  }

  state = {
    loginType: 'default',
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { dispatch, form: { validateFields } } = this.props;
    validateFields((err, values) => {
      values['type'] =  this.state.loginType;
      if (!err) {
        dispatch({
          type: 'system/login',
          payload: values,
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <DocumentTitle title='用户登录'>
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.titleContainer}>
                <Link to="/">
                  <div>
                    <img className={styles.logo} src={logo} alt="logo"/>
                    <span className={styles.title}>IT资产管理</span>
                  </div>
                </Link>
              </div>
              <div className={styles.desc}>灵活、强大、功能全面的开源IT资产管理平台</div>
            </div>
            <div className={styles.formContainer}>
              <Tabs classNam={styles.tabs} onTabClick={e => this.setState({loginType: e})}>
                <Tabs.TabPane tab="普通登录" key="default"/>
                <Tabs.TabPane tab="LDAP登录" key="ldap"/>
              </Tabs>
              <Form onSubmit={this.handleSubmit} className={styles.login_form}>
                <Form.Item>
                  {getFieldDecorator('username', {
                    rules: [{ required: true, message: '请输入用户名' }],
                  })(
                    <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名" />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('password', {
                    rules: [{ required: true, message: '请输入密码' }],
                  })(
                    <Input prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('secret', {
                    rules: [{ required: false, message: '请输入动态口令' }],
                  })(
                    <Input prefix={<CodeOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="动态口令" />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: true,
                  })(
                    <Checkbox>记住用户名</Checkbox>
                  )}
                  {/* <a className={styles.login_form_forgot} href="">Forgot password</a> */}
                  
                  <Button loading={this.props.loading} type="primary" htmlType="submit" className={styles.login_form_button}>
                    登录
                  </Button>
                  {/* Or <a href="">register now!</a> */}
                </Form.Item>
              </Form>
            </div>
          </div>
          <GlobalFooter
            links={[]}
            copyright={
              <Fragment>
                <div style={{color: 'rgba(0, 0, 0, .45)'}}>Copyright <CopyrightOutlined /> © 2022 IT资产管理平台 </div>
              </Fragment>
            }
          />
        </div>
      </DocumentTitle>
    );
  }
}

export default Form.create()(UserLayout)



