import React from 'react';
import styles from './index.module.css';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, message } from 'antd';
import lds from "lodash";
import { hasPermission } from '@/utils/globalTools';


class LDAPSetting extends React.Component {
  constructor(props) {
    super(props);
    this.setting = JSON.parse(lds.get(this.props.settings, 'ldap_service.value', "{}"));
    this.state = {
      loading: false,
      ldap_test_loading: false,
    }
  }

  handleSubmit = () => {
    const formData = [];
    this.props.form.validateFields((err, data) => {
      if (!err) {
        this.setState({loading: true});
        formData.push({name: 'ldap_service', value: JSON.stringify(data)});
        this.props.dispatch({ 
          type: 'system/settingModify',
          payload: {
            Data: formData,
          }
        }).finally(() => this.setState({loading: false}))
      }
    })
  };

  ldapTest = () => {
    this.props.form.validateFields((error, data) => {
      console.log(data);
      if (!error) {
        this.setState({ldap_test_loading: true});
        this.props.dispatch({ 
          type: 'system/settingLdapTest',
          payload: data,
        }).finally(() => ()=> this.setState({ldap_test_loading: false}))
      }
    })
  };

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <React.Fragment>
        <div className={styles.title}>LDAP设置</div>
        <Form style={{maxWidth: 400}} labelCol={{span: 8}} wrapperCol={{span: 16}}>
          <Form.Item required label="LDAP服务地址">
            {getFieldDecorator('add', {initialValue: this.setting['add'],
              rules: [{required: true, message: '请输入LDAP服务地址'}]})(
              <Input placeholder="例如：ldap.yff.dev"/>
            )}
          </Form.Item>
          <Form.Item required label="LDAP服务端口">
            {getFieldDecorator('port', {initialValue: this.setting['port'],
              rules: [{required: true, message: '请输入LDAP服务端口'}]})(
              <Input placeholder="例如：389"/>
            )}
          </Form.Item>
          <Form.Item required label="LDAP搜索DN">
            {getFieldDecorator('searchDn', {initialValue: this.setting['searchDn'],
              rules: [{required: true, message: '有搜索权限的LDAP用户DN。如果LDAP服务器不支持匿名搜索，则需要配置此DN及其密码。'}]})(
              <Input placeholder="例如：cn=admin,dc=yff,dc=dev"/>
            )}
          </Form.Item>
          <Form.Item required label="LDAP搜索密码">
            {getFieldDecorator('searchPwd', {initialValue: this.setting['searchPwd'],
              rules: [{required: true, message: '请输入LDAP搜索密码'}]})(
              <Input.Password placeholder="请输入LDAP搜索密码"/>
            )}
          </Form.Item>
          <Form.Item required label="LDAP基础DN">
            {getFieldDecorator('baseDn', {initialValue: this.setting['baseDn'],
              rules: [{required: true, message: '用来在LDAP和AD中搜寻用户的基础DN。'}]})(
              <Input placeholder="例如：ou=MHS,dc=mhs,dc=local"/>
            )}
          </Form.Item>
          <Form.Item>
            {hasPermission('system.ldap.test') &&
            <Button type="danger" loading={this.state.ldap_test_loading} style={{ marginRight: '10px' }}
                    onClick={this.ldapTest}>测试LDAP</Button>}
            {hasPermission('system.setting.edit') &&
            <Button type="primary" loading={this.state.loading} onClick={this.handleSubmit}>保存设置</Button>}
          </Form.Item>
        </Form>
      </React.Fragment>
    )
  }
}
export default Form.create()(LDAPSetting)
