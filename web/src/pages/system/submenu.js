import React from "react";
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
  message,
  Pagination,
} from "antd";
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools";

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ loading, system }) => {
    return {
      subMenuLoading: loading.effects['system/getSubMenu'],
      subMenuList: system.subMenuList,
      subMenuCount: system.subMenuCount,
      menuList: system.menuList,
    }
 })


class SubMenuPage extends React.Component {
  state = {
    visible: false,
    editCacheData: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'system/getMenu' });
    dispatch({ 
      type: 'system/getSubMenu',
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

  // Modal 取消事件
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  // 新增/修改 确定事件
  handleOk = () => {
    const { dispatch, form: { validateFields } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const obj = this.state.editCacheData;
        console.log(obj)
        if (Object.keys(obj).length) {
          if (
            obj.name    === values.name && 
            obj.url     === values.url && 
            obj.desc    === values.desc && 
            obj.pid     === values.pid && 
            obj.icon    === values.icon 
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'system/subMenuEdit',
              payload: values,
            });
            
          }
        } else {
          values.type = 1;
          dispatch({
            type: 'system/subMenuAdd',
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
        type: 'system/subMenuDel',
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
    values.title =  '编辑菜单-' + values.name;
    this.setState({ 
      visible: true ,
      editCacheData: values
    });
    
  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getSubMenu',
      payload: {
        page: page,
        pageSize: 10, 
      }
    });
  };

  columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'name',
      dataIndex: 'name',
    },
    {
      title: 'url',
      dataIndex: 'url',
    },
    {
      title: 'icon',
      dataIndex: 'icon',
    },
    {
      title: '描述',
      dataIndex: 'desc',
    },
    
    {
    title: '操作',
    key: 'action',
    render: (text, record) => (
      <span>
        {hasPermission('submenu-edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
        <Divider type="vertical" />
        <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
          {hasPermission('submenu-del') && <a title="删除" ><DeleteOutlined />删除</a>}
        </Popconfirm>
      </span>
    ),
  },
  ];
  
  render() {
    const {visible, editCacheData } = this.state;
    const {menuList, subMenuList, subMenuCount, subMenuLoading, form: { getFieldDecorator } } = this.props;
    const addSubMenu = <Button type="primary" onClick={this.showMenuAddModal} >新增二级菜单</Button>;

    const extra = <Row gutter={16}>
        {hasPermission('submenu-add') && <Col span={10}>{addSubMenu}</Col>}
    </Row>;

    return (
      <div>
        <Modal
          title= { editCacheData.title || "新增二级菜单" }
          destroyOnClose="true"
          // pagination= { {pageSizeOptions: ['30', '40'], showSizeChanger: true}}
          visible= {visible}
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
            <FormItem label="图标">
              {getFieldDecorator('icon', {
                initialValue: editCacheData.icon || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="链接">
              {getFieldDecorator('url', {
                initialValue: editCacheData.url || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="描述">
              {getFieldDecorator('desc', {
                initialValue: editCacheData.desc || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="父菜单">
              {getFieldDecorator('pid', {
                initialValue: editCacheData.pid || 'Please select' ,
                rules: [{ required: true }],
              })(
                <Select
                  placeholder="Please select"
                  onChange={this.handleChange}
                  style={{ width: '100%' }}
                >
                {menuList.map(x => <Option key={x.id} value={x.id}>{x.name}</Option>)}
                </Select>
              )}
            </FormItem>
          </Form> 
        </Modal>

        <Card title="" extra={extra}>
          <Table  
          pagination={{
            showQuickJumper: true,
            total: subMenuCount,
            showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
            onChange: this.pageChange
          }}
          columns={this.columns} dataSource={subMenuList} loading={subMenuLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default Form.create()(SubMenuPage);
