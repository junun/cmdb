import React from "react";
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
  Form,
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
    dcList: asset.dcList,
    dcCount: asset.dcCount,
    dcLoading: loading.effects['asset/getDc'],
  }
})


class DataCenterPage extends React.Component {
  // 定义一个表单
  formRef = React.createRef();

  state = {
    visible: false,
    editCacheData: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/getDc',
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
      type: 'asset/getDc',
      payload: {
        page: page,
        pageSize: 10,
      }
    });
  };

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

  handleOk = () => {
    const { dispatch, form: { validateFields } } = this.props;
    validateFields((err, values) => {
      if (!err) {
        const obj = this.state.editCacheData;
        if (Object.keys(obj).length) {
          if (
            obj.name      === values.name &&
            obj.address   === values.address &&
            obj.network   === values.network &&
            obj.desc      === values.desc
          ) {
            message.warning('没有内容修改， 请检查。');
            return false;
          } else {
            values.id = obj.id;
            dispatch({
              type: 'asset/dcEdit',
              payload: values,
            });

          }
        } else {
          dispatch({
            type: 'asset/dcAdd',
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
      editCacheData: values,
      visible: true
    });
  };

  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'asset/dcDel',
        payload: values,
      });
    } else {
      message.error('错误的id');
    }
  };

  columns = [
    {
      title: 'dc',
      dataIndex: 'name',
    },{
      title: '地址',
      dataIndex: 'address',
      ellipsis: true
    }, {
      title: '网段',
      dataIndex: 'network',
      ellipsis: true
    }, {
      title: '备注',
      dataIndex: 'desc',
      ellipsis: true
    }, {
      title: '操作',
      width: 200,
      render: (text, record) => (
        <span>
          {hasPermission('asset.dc.edit') && <a onClick={()=>{this.handleEdit(record)}}><EditOutlined />编辑</a>}
          <Divider type="vertical" />
          {
            hasPermission('asset.dc.del') &&
            <Popconfirm title="你确定要删除吗?"  onConfirm={()=>{this.deleteRecord(record.id)}} onCancel={()=>{this.cancel()}}>
              <a title="删除" ><DeleteOutlined />删除</a>
            </Popconfirm>
          }
      </span>
      ),
    }];

  render() {
    const {visible, editCacheData} = this.state;
    const {dcList, dcCount, dcLoading} = this.props;
    const addDc = <Button type="primary" onClick={this.showAddModal} >新增</Button>;
    const extra = <Row gutter={16}>
      {hasPermission('asset.dc.add') && <Col span={10}>{addDc}</Col>}
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
            <FormItem label="dc"
                      name="name"
                      rules={[{ required: true, whitespace: true, message: '名字' }]}
            >
              <Input placeholder="名字"/>
            </FormItem>
            <FormItem label="地址"
                      name="address"
                      rules={[{ required: true, whitespace: true, message: '地址' }]}
            >
              <Input placeholder="地址"/>
            </FormItem>
            <FormItem label="网段"
                      name="network"
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
              total: dcCount,
              showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
              onChange: this.pageChange
            }}
            columns={this.columns} dataSource={dcList} loading={dcLoading} rowKey="id" />
        </Card>
      </div>
    );
  }
}

export default DataCenterPage;
