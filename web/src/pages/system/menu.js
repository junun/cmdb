import React from "react";
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Card, Input, Table, Divider, Modal, Row, Col, Button, Popconfirm, message } from "antd";
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools";

const FormItem = Form.Item;

@connect(({ loading, system }) => {
    return {
      menuList: system.menuList,
      menuLoading: loading.effects['system/getMenu'],
    }
 })


class MenuPage extends React.Component {
  state = {
    visible: false,
    editCacheData: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getMenu',
      payload: {
        page: 1,
        pageSize: 10, 
      }
    });
  }
  
  showMenuAddModal = () => {
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
            obj.name   === values.name &&
            obj.icon   === values.icon
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'system/menuEdit',
              payload: values,
            });
            
          }
        } else {
          values.Type     = 1;
          values.ParentId = 0;
          dispatch({
            type: 'system/menuAdd',
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
        type: 'system/menuDel',
        payload: values,
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
    values.title =  '编辑菜单-' + values.Name;
    this.setState({ 
      visible: true ,
      editCacheData: values
    });
    
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '菜单名',
      dataIndex: 'name',
    },
    {
      title: 'Icon',
      dataIndex: 'icon',
    },
    {
    title: '操作',
    key: 'action',
    render: (text, record) => (
      <span>
          {hasPermission('system.menu.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
        <Divider type="vertical" />
          <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('system.menu.del') && <a title="删除" ><DeleteOutlined />删除</a>}
          </Popconfirm>
      </span>
    ),
  },
  ];
  
  render() {
    const {visible, editCacheData} = this.state;
    const {menuList, menuLoading, form: { getFieldDecorator } } = this.props;
    const addMenu = <Button type="primary" onClick={this.showMenuAddModal} >新增一级菜单</Button>;
    const extra = <Row gutter={16}>
          {hasPermission('system.menu.add') && <Col span={10}>{addMenu}</Col>}
      </Row>;
    return (
      <div>
        <Modal
          title= {editCacheData.title || "新增一级菜单" }
          visible= {visible}
          destroyOnClose= "true"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="名字">
              {getFieldDecorator('name', {
                initialValue: editCacheData.name || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
          </Form> 
          <FormItem label="图标">
                {getFieldDecorator('icon', {
                  initialValue: editCacheData.icon || '',
                  rules: [{ required: true }],
                })(
                  <Input />
                )}
              </FormItem>
        </Modal>

        <Card title="" extra={extra}>
          <Table pagination={false} columns={this.columns} dataSource={menuList} loading={menuLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default Form.create()(MenuPage);
