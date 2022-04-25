import React from "react";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  LockOutlined, TagsOutlined,
  UnlockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Card,
  Input,
  Table,
  Divider,
  Modal,
  Select,
  Row,
  Col,
  Button,
  Popconfirm,
  Switch,
  message,
  Dropdown, Menu,
} from 'antd';
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools"
import Link from 'umi/link';
import UserPerm from '@/pages/system/UserPerm';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ loading, system }) => {
    return {
      userList: system.userList,
      userCount: system.userCount,
      usersLoading: loading.effects['system/getUser'],
      roleList: system.roleList,
      allPermList: system.allPermList,
      userPermList: system.userPermList,
    }
 })

class UserPage extends React.Component {
  state = {
    visible: false,
    editCacheData: {},
    userPermVisible: false,
    uid:0,
    disabled:false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'system/getRole' });
    dispatch({
      type: 'system/getUser',
      payload: {
        page: 1,
        pageSize: 10,
      }
    });
  }
  
  showUserAddModal = () => {
    this.setState({ 
      editCacheData: {},
      visible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
      disabled: false,
    });
  };

  handleOk = () => {
    const { dispatch, form: { validateFields } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const obj = this.state.editCacheData;
        values.twoFactor   =  values.twoFactor ? 1 : 0
        if (Object.keys(obj).length) {
          if (
            obj.nickname   === values.nickname &&
            obj.mobile     === values.mobile &&
            obj.email      === values.email &&
            obj.twoFactor  === values.twoFactor &&
            obj.rid        === values.rid
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            values.isActive =  obj.isActive;
            dispatch({
              type: 'system/userEdit',
              payload: values,
            }).then(() => {
              this.setState({ 
                visible: false,
              });
            })
          }
        } else {
          if (values.password !== values.rePassword) {
            message.warning('两次输入密码不一样！');
            return false;
          } else {
            dispatch({
              type: 'system/userAdd',
              payload: values,
            }).then(() => {
              this.setState({ 
                visible: false,
              });
            })
          }
        }
        // 重置 `visible` 属性为 false 以关闭对话框
      }
    });
  };

  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'system/userDel',
        payload: values.id,
      });
    } else {
      message.error('错误的id');
    }
  };

  // Popconfirm 取消事件
  cancel = () => {
  };

  //显示编辑界面
  handleEdit = (values) => {
    values.title =  '编辑用户-' + values.nickname;
    this.setState({ 
      visible: true ,
      editCacheData: values,
      disabled:true,
    });
  };

  // 禁用/启用用户
  changeActive = (values) => {
    const { dispatch } = this.props;
    if (values.isActive) {
      values.isActive = 0
    } else {
      values.isActive = 1
    }

    dispatch({
      type: 'system/userEdit',
      payload: values,
    });
  };

  // 重置密码
  restPasswd = (values) => {
    const { dispatch } = this.props;
    values.password = 'ss123456';
    dispatch({
      type: 'system/userEdit',
      payload: values,
    });
  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getList',
      payload: {
        page: page,
      }
    });
  };

  switchPagePerm = () => {
    this.setState({
      userPermVisible: !this.state.userPermVisible,
    });
  };

  //显示权限界面
  handlePerm = (values) => {
    values.title =  '功能权限-' + values.name;
    console.log(values);
    this.setState({
      editCacheData: values,
      uid: values.id,
      userPermVisible: true,
    });
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'nickname',
    },
    {
      title: '类型',
      dataIndex: 'type',
      'render': (type) => {
        if (type === 2) {
          return  'LDAP用户'
        } else {
          return '平台用户'
        }
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      'render': isActive => 1 && '正常' || '禁用',
    },
    {
      title: '角色',
      dataIndex: 'rid',
      'render': rid => this.props.roleList.map(x => {
        if (rid === x.id) {
          return x.name
        }
      })
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
        {hasPermission('system.user.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
        <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record)}} onCancel={()=>{this.cancel()}}>
          {hasPermission('system.user.del') && <a title="删除" ><DeleteOutlined />删除</a>}
        </Popconfirm>
        <Divider type="vertical" />
          {
            record.isActive
            &&
            <Popconfirm title="你确定要禁用用户吗?"  onConfirm={()=>{this.changeActive(record)}} onCancel={()=>{this.cancel()}}>
              {hasPermission('system.user.edit') && <a title="禁用用户" ><LockOutlined />禁用用户</a>}
            </Popconfirm>
            ||
            <Popconfirm title="你确定要启用用户吗?"  onConfirm={()=>{this.changeActive(record)}} onCancel={()=>{this.cancel()}}>
              {hasPermission('system.user.edit') && <a title="启用用户" ><UnlockOutlined />启用用户</a>}
            </Popconfirm>
          }
          <Divider type="vertical" />
          <Dropdown overlay={() => this.moreMenus(record)} trigger={['click']}>
              <a>
                 <DownOutlined onClick={e => e.preventDefault()} style={{fontSize: 16, marginRight: 4, color: '#1890ff'}}/>更多
              </a>
          </Dropdown>
      </span>
      ),
    },
  ];


  moreMenus = (record) => (
    <Menu>
      <Menu.Item>
        {
          hasPermission('system.user.perm') &&
          <a onClick={()=>{this.handlePerm(record)}}>
            <TagsOutlined />额外权限
          </a>
        }
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item>
        <Popconfirm title="你确定要重置吗?"  onConfirm={()=>{this.restPasswd(record)}} onCancel={()=>{this.cancel()}}>
          {hasPermission('system.user.edit') && <a title="重置" ><UserOutlined />重置密码</a>}
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );
  
  render() {
    const {visible, editCacheData, userPermVisible} = this.state;
    const {roleList, userList, userCount, usersLoading,allPermList, userPermList, form: { getFieldDecorator } } = this.props;
    const addUser = <Button type="primary" onClick={this.showUserAddModal} >新增用户</Button>;
    const extra = <Row gutter={16}>
          {hasPermission('system.user.add') && <Col span={10}>{addUser}</Col>}
      </Row>;


    return (
      <div>
        <Modal
          width={800}
          maskClosable={false}
          title= { editCacheData.title || "新建用户" }
          visible= {visible}
          destroyOnClose= "true"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form labelCol={{span: 6}} wrapperCol={{span: 14}}>
            <FormItem label="登录名">
              {getFieldDecorator('name', {
                initialValue: editCacheData.name || '',
                rules: [{ required: true }],
              })(
                <Input disabled={this.state.disabled}/>
              )}
            </FormItem>
            <FormItem label="姓名">
              {getFieldDecorator('nickname', {
                initialValue: editCacheData.nickname || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="手机">
              {getFieldDecorator('mobile', {
                initialValue: editCacheData.mobile || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="邮箱">
              {getFieldDecorator('email', {
                initialValue: editCacheData.email || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="双因子认证">
              {getFieldDecorator('twoFactor', {
                // initialValue: editCacheData.TwoFactor && true || false,
                initialValue: editCacheData.twoFactor && true || false,
                valuePropName: "checked",
                rules: [{ required: false }],
              })(
                <Switch/>
              )}
            </FormItem>
            { !Object.keys(editCacheData).length  && 
              <FormItem label="密码">
                {getFieldDecorator('password', {
                  initialValue: editCacheData.password || '',
                  rules: [{ required: true }],
                })(
                  <Input type="password" />
                )}
              </FormItem>
            }
            { !Object.keys(editCacheData).length  && 
              <FormItem label="确定密码">
                {getFieldDecorator('rePassword', {
                  initialValue: editCacheData.rePassword || '',
                  rules: [{ required: true }],
                })(
                  <Input type="password" />
                )}
              </FormItem>
            }
            <FormItem label="角色">
              {getFieldDecorator('rid', {
                initialValue: editCacheData.rid || '' ,
                rules: [{ required: true }],
              })(
                <Select
                  placeholder="Please select"
                  onChange={this.handleChange}
                  style={{ width: '100%' }}
                >
                {roleList.map(x => <Option key={x.id} value={x.id}>{x.name}</Option>)}
                </Select>
              )}
            </FormItem>
          </Form> 
        </Modal>
        <Card title="" extra={extra}>
          <Table 
          pagination={{
            showQuickJumper: true,
            total: userCount,
            showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
            onChange: this.pageChange
          }}
          columns={this.columns} dataSource={userList} loading={usersLoading} rowKey="id" />
        </Card>

        {userPermVisible &&
          <UserPerm
            uid={this.state.uid}
            allPermList={allPermList}
            userPermList={userPermList}
            dispatch={this.props.dispatch}
            onCancel={this.switchPagePerm}
            onOk={this.handlePermOk}
          />
        }
      </div>
    );
  }
}

export default Form.create()(UserPage);
