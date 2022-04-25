
import React, {Fragment, Component} from "react";
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
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
  message,
} from "antd";
import {hasPermission} from "@/utils/globalTools"
import {connect} from "dva";

const FormItem = Form.Item;

@connect(({ loading, asset }) => {
  return {
    roleList: asset.roleList,
    roleCount: asset.roleCount,
    hostRoleLoading: loading.effects['host/getRole'],
  }
})


class RolePage extends React.Component {
  state = {
    visible: false,
    editCacheData: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/getRole',
      payload: {
        page: 1,
        pageSize: 10,
      }
    });
  }

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/getRole',
      payload: {
        page: page,
        pageSize: 10,
      }
    });
  };

  showTypeAddModal = () => {
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
            obj.desc   === values.desc
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'asset/roleEdit',
              payload: values,
            });

          }
        } else {
          dispatch({
            type: 'asset/roleAdd',
            payload: values,
          });
        }
        // 重置 `visible` 属性为 false 以关闭对话框
        this.setState({ visible: false });
      }
    });
  };

  //显示编辑界面
  handleEdit = (values) => {
    values.title =  '编辑-' + values.name;
    this.setState({
      visible: true ,
      editCacheData: values
    });
  };

  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'asset/roleDel',
        payload: values,
      });
    } else {
      message.error('错误的id');
    }
  };

  columns = [
    {
      title: '资产类型',
      dataIndex: 'name',
    }, {
      title: '备注',
      dataIndex: 'desc',
      ellipsis: true
    }, {
      title: '操作',
      width: 200,
      render: (text, record) => (
        <span>
          {hasPermission('asset.role.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
          <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('asset.role.del') && <a title="删除" ><DeleteOutlined />删除</a>}
          </Popconfirm>
      </span>
      ),
    }];

  render() {
    const {visible, editCacheData} = this.state;
    const {roleList, roleCount, hostRoleLoading, form: { getFieldDecorator } } = this.props;
    const addRole= <Button type="primary" onClick={this.showTypeAddModal} >新增资产类型</Button>;
    const extra = <Row gutter={16}>
      {hasPermission('asset.role.add') && <Col span={10}>{addRole}</Col>}
    </Row>;
    return (
      <div>
        <Modal
          title= {editCacheData.title || "新增资产类型" }
          visible= {visible}
          destroyOnClose= "true"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form>
            <FormItem label="类型名字">
              {getFieldDecorator('name', {
                initialValue: editCacheData.name || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>

            <FormItem label="备注信息">
              {getFieldDecorator('desc', {
                initialValue: editCacheData.desc || '',
                rules: [{ required: true }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>

        <Card title="" extra={extra}>
          <Table
            pagination={{
              showQuickJumper: true,
              total: roleCount,
              showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
              onChange: this.pageChange
            }}
            columns={this.columns} dataSource={roleList} loading={hostRoleLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default Form.create()(RolePage);
