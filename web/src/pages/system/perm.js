import React from "react";
import { DeleteOutlined, EditOutlined, SyncOutlined } from '@ant-design/icons';
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
} from "antd";
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools"
import SearchForm from '@/components/SearchForm';

const FormItem = Form.Item;
const Option = Select.Option;


@connect(({ loading, system }) => {
    return {
      subMenuList: system.subMenuList,
      permList: system.permList,
      permCount: system.permCount,
      permLoading: loading.effects['system/getPerm'],
    }
 })

class PermPage extends React.Component {
  state = {
    visible: false,
    editCacheData: {},
    pid:'',
    name:'',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getSubMenu',
      payload: {
        page: 1,
        pageSize: 1000,
        isSubMenu: 1,
        type:1,
      }
    });
    dispatch({
      type: 'system/getPerm',
      payload: {
        page: 1,
        pageSize: 10,
      }
    });
  }

  showPermAddModal = () => {
    this.setState({
      visible: true,
      editCacheData: {},
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
            obj.desc       === values.desc &&
            obj.perm       === values.perm &&
            obj.pid        === values.pid
          ) {
            message.warning('没有内容修改， 请检查。');
          } else {
            values.id = obj.id;
            values.searchPid  = this.state.pid;
            values.searchname = this.state.name;
            dispatch({
              type: 'system/permEdit',
              payload: values,
            });

          }
        } else {
          values.type = 2;
          dispatch({
            type: 'system/permAdd',
            payload: values,
          });
        }
        // 重置 `visible` 属性为 false 以关闭对话框
        this.setState({ visible: false });
      }
    });
  };

  // 删除一条记录
  deleteRecord = (id) => {
    const { dispatch } = this.props;
    if (id) {
      let values = {};
      values.id   = id;
      values.pid  = this.state.pid;
      values.name = this.state.name;
      dispatch({
        type: 'system/permDel',
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
    values.title =  '编辑权限-' + values.name;
    this.setState({
      visible: true ,
      editCacheData: values
    });

  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'system/getPerm',
      payload: {
        page: page,
      }
    });
  };

  fetchRecords = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'system/getPerm',
      payload: {
        page: 1,
        pageSize: 10,
        pid : this.state.pid,
        name: this.state.name,
      }
    });
  };

  columns = [
    {
      title: 'Id',
      dataIndex: 'id',
    },
    {
      title: '名字',
      dataIndex: 'name',
    },
    {
      title: '权限标识',
      dataIndex: 'perm',
    },
    {
      title: '描述',
      dataIndex: 'desc',
    },
    {
      title: '父节点',
      dataIndex: 'pid',
      'render': pid => this.props.subMenuList.map(x => {
        if (pid === x.id) {
          return x.name
        }
      })
    },
    {
    title: '操作',
    key: 'action',
    render: (text, record) => (
        <span>
          {hasPermission('perm-edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
          <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('perm-del') && <a title="删除" ><DeleteOutlined />删除</a>}
          </Popconfirm>
        </span>
      ),
    },
  ];

  render() {
    const {visible, editCacheData} = this.state;
    const {subMenuList, permList, permLoading, permCount, form: { getFieldDecorator } } = this.props;
    const addPerm = <Button type="primary" onClick={this.showPermAddModal} >新增权限</Button>;
    const extra = <Row gutter={16}>
        {hasPermission('perm-add') && <Col span={2}>{addPerm}</Col>}
    </Row>;

    return (
      <div>
        <SearchForm>
          <SearchForm.Item span={8} title="权限类别">
            <Select
              placeholder="请选择"
              onChange={value => this.state.pid = value}
              style={{ width: '100%' }}
            >
              {subMenuList.map(x =>
                <Select.Option key={x.id} value={x.id}>
                  {x.name}
                </Select.Option>)}
            </Select>
          </SearchForm.Item>
          <SearchForm.Item span={8} title="权限项标识">
            <Input allowClear  onChange={e => this.state.name = e.target.value} placeholder="请输入"/>
          </SearchForm.Item>
          <SearchForm.Item span={8}>
            <Button type="primary" icon={<SyncOutlined />} onClick={this.fetchRecords}>搜索</Button>
          </SearchForm.Item>
        </SearchForm>
        <Modal
          title= { editCacheData.title || "新增" }
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
                <Input style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label="权限标识">
              {getFieldDecorator('perm', {
                initialValue: editCacheData.perm || '',
                rules: [{ required: true }],
              })(
                <Input style={{ width: '100%' }}/>
              )}
            </FormItem>
            <FormItem label="描述">
              {getFieldDecorator('desc', {
                initialValue: editCacheData.desc || '',
                rules: [{ required: true }],
              })(
                <Input style={{ width: '100%' }}/>
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
                  {subMenuList && subMenuList.map(x => <Option key={x.id} value={x.id}>{x.name}</Option>)}
                </Select>
              )}
            </FormItem>

          </Form>
        </Modal>
        <Card title="" extra={extra}>
          <Table
          pagination={{
            showQuickJumper: true,
            total: permCount,
            showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
            onChange: this.pageChange
          }}
          columns={this.columns} dataSource={permList} loading={permLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default Form.create()(PermPage);
