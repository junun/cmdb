import React from "react";
import { CiOutlined, DeleteOutlined, EditOutlined, TagsOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {
  Card,
  Input,
  Table,
  Divider,
  Modal,
  Row,
  Col,
  Button,
  Popconfirm,
  Tree,
  message,
} from "antd";
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools"
import PagePerm from "./PagePerm";


const FormItem = Form.Item;
// const Option = Select.Option;
const TreeNode = Tree.TreeNode;

@connect(({ loading, system }) => {
    return {
      roleList: system.roleList,
      roleCount: system.roleCount,
      systemsLoading: loading.effects['system/getRole'],
      allPermList: system.allPermList,
      rolePermList: system.rolePermList,
      roleVisible: system.roleVisible,
      // checkedKeys: [],
    }
 })

class RolePage extends React.Component {
  state = {
    roleVisible: this.props.roleVisible,
    editCacheData: {},
    value: '用户列表',
    roleId: '',
    checkedKeys: [],
    pagePermVisible: false,
    rid:0,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'system/getRole' });
    dispatch({ type: 'system/getAllPerm' });
  }
  
  showRoleAddModal = () => {
    this.setState({ 
      editCacheData: {},
      visible: true 
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  handleOk = () => {
    const { dispatch, form: { validateFields } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const obj = this.state.editCacheData;
        if (Object.keys(obj).length) {
          if (
            obj.name       === values.name &&
            obj.desc     === values.desc
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'system/roleEdit',
              payload: values,
            });
            
          }
        } else {
          dispatch({
            type: 'system/roleAdd',
            payload: values,
          });
        }
        // 重置 `visible` 属性为 false 以关闭对话框
        this.setState({ visible: false });
      }
    });
  };

  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'system/roleDel',
        payload: values,
      });
    } else {
      message.error('错误的id');
    }
  };

  // Popconfirm 取消事件
  cancel = () => {
  };

  switchPagePerm = () => {
    this.setState({ 
      pagePermVisible: !this.state.pagePermVisible,
    });
  };

  switchAppPerm = () => {
    this.setState({ 
      appPermVisible: !this.state.appPermVisible,
    });
  };

  //显示编辑界面
  handleEdit = (values) => {
    values.title =  '编辑角色-' + values.name;
    this.setState({ 
      visible: true ,
      editCacheData: values
    });
    
  };

  //显示权限界面
  handlePerm = (values) => {
    values.title =  '功能权限-' + values.name;
    this.setState({ 
      editCacheData: values,
      pagePermVisible: true,
      rid: values.id,
    });
  };

  //取消权限界面
  handlePermCancel = () => {
    const { dispatch } = this.props;
    dispatch({ 
      type: 'system/cancelRolePerm',
    });
  };

  onCheck = (values) => {
    this.setState({ 
      checkedKeys: values,
    });
  };

  handlePermOk = (item) => {
    const { dispatch } = this.props;
    // const keys = this.state.checkedKeys;
    const keys = item;
    if (keys.length >0) {
      const values = {};
      values.id = this.state.editCacheData.id;
      values.Codes = keys;
      dispatch({
        type: 'system/rolePermsAdd',
        payload: values,
      });
    } else {
      message.warning('没有内容修改， 请检查。');
      return false;
    }
    
    dispatch({ 
      type: 'system/cancelRolePerm',
    });
  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getRole',
      payload: {
        page: page,
      }
    });
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '角色名',
      dataIndex: 'name',
    },
    {
      title: '关联用户',
      dataIndex: 'type',
    },
    // {
    //   title: '关联应用',
    //   dataIndex: 'name',
    // },
    {
      title: '描述信息',
      dataIndex: 'desc',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          {hasPermission('system.role.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
          {
            hasPermission('system.role.perm') &&
            <a onClick={()=>{this.handlePerm(record)}}>
              <TagsOutlined />功能权限
            </a>
          }
          <Divider type="vertical" />
          <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('system.role.del') && <a title="删除" ><DeleteOutlined />删除</a>}
          </Popconfirm>
        </span>
      ),
    },
  ];
  
  render() {
    const {pagePermVisible, visible, editCacheData} = this.state;
    const {rolePermList, roleVisible, allPermList, roleList, roleCount,
    rolesLoading, form: { getFieldDecorator } } = this.props;
    const addRole = <Button type="primary" onClick={this.showRoleAddModal} >新增角色</Button>;

    const extra = <Row gutter={16}>
        {hasPermission('role-add') && <Col span={10}>{addRole}</Col>}
    </Row>;
    
    const loop = data => data.map((item) => {
      if (item.children && item.children.length) {
        return <TreeNode key={item.id} title={item.Name} value={item.id} >{loop(item.children)}</TreeNode>;
      }
      return <TreeNode value={item.id} key={item.id} title={item.Name} />;
    });

    return (
      <div>
        <Modal
          title= { editCacheData.title  }
          visible= {roleVisible}
          destroyOnClose= "true"
          // onOk={this.handlePermOk}
          onCancel={this.handlePermCancel}
        >
          <Tree 
            showLine
            checkable
            multiple={true}
            defaultExpandAll={true}
            defaultCheckedKeys={rolePermList || ''}
            onSelect={this.onSelect} 
            onCheck={this.onCheck}
          >
            {loop(allPermList)}
          </Tree>
        </Modal>
        
        <Modal
          title= { editCacheData.title || "新增角色" }
          visible= {visible}
          destroyOnClose= "true"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="角色名">
              {getFieldDecorator('name', {
                initialValue: editCacheData.name || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="描述信息">
              {getFieldDecorator('desc', {
                initialValue: editCacheData.desc || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
          </Form> 
        </Modal>

        {pagePermVisible && 
          <PagePerm 
            rid={this.state.rid}
            allPermList={allPermList}
            rolePermList={rolePermList}
            dispatch={this.props.dispatch}
            onCancel={this.switchPagePerm} 
            onOk={this.handlePermOk}
          />
        }

        <Card title="" extra={extra}>
          <Table 
          pagination={{
            showQuickJumper: true,
            total: roleCount,
            showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
            onChange: this.pageChange
          }}
          columns={this.columns} dataSource={roleList} loading={rolesLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default Form.create()(RolePage);
