import React from 'react';
import { connect } from 'react-redux';
import {Form} from 'antd';
import '@ant-design/compatible/assets/index.css';
import {
  Card, Col, Row, message, Input, Table,Select,
  Popconfirm, Divider, Button, Modal,
} from 'antd';

import { hasPermission } from '@/utils/globalTools';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
const FormItem = Form.Item;



@connect(({ loading, asset }) => {
  return {
    roleList: asset.roleList,
    roleDetailList: asset.roleDetailList,
    roleDetailCount: asset.roleDetailCount,
    roleDetailLoading: loading.effects['asset/getRoleDetail'],
  }
})


class RoleDetail extends React.Component {
  // 定义一个表单
  formRef = React.createRef();

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
        pageSize: 999,
      }
    });

    dispatch({
      type: 'asset/getRoleDetail',
      payload: {
        page: 1,
        pageSize: 10,
      }
    });
  }

  showAddModal = () => {
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


  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'project/roleDetailDel',
        payload: values,
      });
    } else {
      message.error('错误的id');
    }
  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/getRoleDetail',
      payload: {
        page: page,
        pageSize: 10,
      }
    });
  };

  handleOk = () => {
    this.formRef.current.validateFields()
      .then(values => {
        this.formRef.current.resetFields();
        const { dispatch } = this.props;
        const obj = this.state.editCacheData;
        if (Object.keys(obj).length) {
          if (
            obj.name    === values.name &&
            obj.pid     === values.pid &&
            obj.config  === values.config &&
            obj.desc    === values.desc
          ) {
            message.warning('没有内容修改!');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'asset/roleDetailEdit',
              payload: values,
            });

          }
        } else {
          dispatch({
            type: 'asset/roleDetailAdd',
            payload: values,
          });
        }

        this.setState({
          visible: false
        });
      }).catch(info => {
        message.error(info);
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



  columns = [
    {
      title: '型号',
      dataIndex: 'name',
    },{
      title: '资产类型',
      dataIndex: 'pid',
      'render': pid => this.props.roleList.map(x => pid === x.id && x.name)
    }, {
      title: '配置',
      dataIndex: 'config',
      ellipsis: false
    }, {
      title: '操作',
      width: 200,
      render: (text, record) => (
        <span>
          {hasPermission('asset.roleDetail.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
          {
            hasPermission('asset.roleDetail.del') &&
            <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
              <a title="删除" ><DeleteOutlined />删除</a>
            </Popconfirm>
          }
      </span>
      ),
    }];

  render() {
    const {visible, editCacheData} = this.state;
    const {roleList, roleDetailList, roleDetailCount, roleDetailLoading} = this.props;

    const add = <Button type="primary" onClick={this.showAddModal} >新增</Button>;

    const extra = <Row gutter={16}>
      {hasPermission('asset.roleDetail.add') && <Col span={10}>{add}</Col>}
    </Row>;

    return (
      <div>
        <Modal
          title= {editCacheData.title || "新增" }
          visible= {visible}
          maskClosable={false}
          destroyOnClose= "true"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Form
            ref={this.formRef}
            initialValues={this.state.editCacheData}
            labelCol={{span: 8}}
            wrapperCol={{span: 14}}>
            <FormItem label="资产类型"
                      name="pid"
                      rules={[{ required: true, message: '选择设备类型' }]}
            >
              <Select
                placeholder="选择资产类型"
              >
                {roleList.map(x => <Select.Option key={x.id} value={x.id}>{x.name}</Select.Option>)}
              </Select>
            </FormItem>
            <FormItem label="资产型号"
                      name="name"
                      rules={[{ required: true, whitespace: true, message: '请输入资产型号' }]}
            >
              <Input placeholder="请输入资产型号"/>
            </FormItem>
            <FormItem label="配置信息"
                      name="config"
                      rules={[{ required: true, whitespace: true, message: '请输入配置信息' }]}
            >
                <Input.TextArea />
            </FormItem>
            <FormItem label="备注信息"
                      name="desc"
                      rules={[{ required: false, whitespace: true, message: '请输入备注信息' }]}
            >
              <Input.TextArea />
            </FormItem>
          </Form>
        </Modal>
        <Card title="" extra={extra}>
          <Table
            pagination={{
              showQuickJumper: true,
              total: roleDetailCount,
              showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
              onChange: this.pageChange
            }}
            columns={this.columns} dataSource={roleDetailList} loading={roleDetailLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default RoleDetail;
