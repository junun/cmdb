import React from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Modal,  Upload, Button, Tooltip, Alert } from 'antd';
import {httpPost} from '@/utils/request';

class ComImport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fileList: [],
    }
  }

  handleSubmit = () => {
    this.setState({loading: true});
    const formData = new FormData();
    formData.append('file', this.state.fileList[0]);
    httpPost(`/api/v1/asset/asset/import`, formData)
      .then(res => {
        res = res.data;
        Modal.info({
          title: '导入结果',
          content: <Form labelCol={{span: 7}} wrapperCol={{span: 14}}>
            <Form.Item style={{margin: 0}} label="导入成功">{res.success.length}</Form.Item>
            {res['skip'].length > 0 && <Form.Item style={{margin: 0, color: '#1890ff'}} label="重复数据">
              <Tooltip title={`相关行：${res['skip'].join(', ')}`}>{res['skip'].length}</Tooltip>
            </Form.Item>}
            {res['dbfail'].length > 0 && <Form.Item style={{margin: 0, color: '#1890ff'}} label="存库错误">
              <Tooltip title={`相关行：${res['dbfail'].join(', ')}`}>{res['dbfail'].length}</Tooltip>
            </Form.Item>}
          </Form>
        })
      }).finally(() => {
        this.props.dispatch({ type: 'asset/getAsset',
          payload: {
            page: 1,
            pageSize: 10, 
          }
        });
        this.setState({loading: false})
      })
  };

  beforeUpload = (file) => {
    this.setState({fileList: [file]});
  };

  onRemove = () => {
    this.setState({fileList: []});
  };

  render() {
    return (
      <Modal
        visible
        width={800}
        maskClosable={false}
        title="批量导入"
        okText="导入"
        onCancel={() => this.props.onCancel()}
        confirmLoading={this.state.loading}
        okButtonProps={{disabled: !this.state.fileList.length}}
        onOk={this.handleSubmit}>
        <Alert closable showIcon type="info" message={null}
               style={{width: 600, margin: '0 auto 20px', color: '#31708f !important'}}
               description="导入或输入的密码仅作首次验证使用，并不会存储密码。"/>
        <Form labelCol={{span: 6}} wrapperCol={{span: 14}}>
          <Form.Item label="模板下载" help="请下载使用该模板填充数据后导入">
            <a href="/resource/资产导入模板.xlsx">资产导入模板.xlsx</a>
          </Form.Item>
          <Form.Item required label="导入数据">
            <Upload 
              name="file" accept=".xls, .xlsx" 
              fileList={this.state.fileList} 
              beforeUpload={this.beforeUpload}
              onRemove={this.onRemove}
            >
              <Button>
                <UploadOutlined /> 点击上传
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default ComImport
