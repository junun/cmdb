import React from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  ImportOutlined, LockOutlined,
  SyncOutlined, UnlockOutlined,
} from '@ant-design/icons';
import '@ant-design/compatible/assets/index.css';
import {
  Form,
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
  DatePicker,
  message,
  InputNumber,
} from "antd";

import moment from 'moment';
import SearchForm from '@/components/SearchForm';
import Import from './Import';
import {connect} from "dva";
import {hasPermission} from "@/utils/globalTools"
import AssetDetailPage from '@/pages/asset/AssetDetail';

const dateFormat = 'YYYY-MM-DD';
const FormItem = Form.Item;


@connect(({ loading, asset }) => {
  return {
    roleList: asset.roleList,
    roleDetailList: asset.roleDetailList,
    dcList: asset.dcList,
    assetList: asset.assetList,
    assetCount: asset.assetCount,
    assetLoading: loading.effects['asset/getAsset'],
  }
})


class AssetPage extends React.Component {
  // 定义一个表单
  formRef = React.createRef();
  
  state = {
    visible: false,
    emptyVisible: false,
    hostAppVisible: false,
    detailVisible: false,
    importVisible: false,
    editCacheData: {},
    detailItem:{},
    roleId:'',
    hostId:'',
    name:'',
    address:'',
    idcId:'',
    status:'',
    snCode:'',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'asset/getAsset',
      payload: {
        page: 1,
        pageSize: 10,
      }
    });
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
        pageSize: 999,
      }
    });
    dispatch({
      type: 'asset/getDc',
      payload: {
        page: 1,
        pageSize: 999,
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
      importVisible: false,
      emptyVisible:false,
      detailVisible: false
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
            obj.name      === values.name &&
            obj.userName  === values.userName &&
            obj.rid       === values.rid &&
            obj.did       === values.did &&
            obj.sn        === values.sn &&
            obj.mac       === values.mac &&
            obj.channel   === values.channel &&
            obj.price     === values.price &&
            obj.warranty  === values.warranty &&
            obj.buyDate   === values.buyDate &&
            obj.desc      === values.desc
          ) {
            message.warning('没有内容修改!');
            return false;
          } else {
            if (values.userName !== '') {
              values.status = 2
            } else {
              values.status = 1
            }
            values.id = obj.id;
            dispatch({
              type: 'asset/assetEdit',
              payload: values,
            });

          }
        } else {
          if (values.userName !== '') {
            values.status = 2
          } else {
            values.status = 1
          }

          dispatch({
            type: 'asset/assetAdd',
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


  // 删除一条记录
  deleteRecord = (values) => {
    const { dispatch } = this.props;
    if (values) {
      dispatch({
        type: 'asset/assetDel',
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
    console.log(values);
    values.title =  '编辑主机-' + values.name;
    // 做个格式转换
    values.buyDate = moment(values.buyDate, dateFormat);
    this.setState({
      visible: true ,
      editCacheData: values
    });
  };

  // 翻页
  pageChange = (page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'asset/getAsset',
      payload: {
        page: page,
        pageSize: 10,
      }
    });
  };

  showDetail = (v) => {
    this.setState({
      detailVisible: true,
      detailItem: v,
    });
  };

  fetchRecords = () => {
    const { dispatch } = this.props;
    dispatch({ type: 'asset/getAsset',
      payload: {
        page: 1,
        pageSize: 10,
        roleId : this.state.roleId,
        sn: this.state.snCode,
        status: this.state.status,
      }
    });
  };



  changeStatus = (values) => {
    const { dispatch } = this.props;
    if (values.status !== 3) {
      values.status = 3
    } else {
      if (values.name !== "")  {
        values.status = 2
      } else {
        values.status = 1
      }
    }

    dispatch({
      type: 'asset/assetEdit',
      payload: values,
    });
  };


  columns = [{
    title: '资产编号',
    dataIndex: 'name',
    render: (text, row) => {
      return <a onClick={() =>  this.showDetail(row)}>{text}</a>;
    },
  }, {
    title: '类型',
    dataIndex: 'rid',
    'render': rid => this.props.roleDetailList.map(x => rid === x.id && x.name)
  }, {
    title: 'DC',
    dataIndex: 'did',
    'render': did => this.props.dcList.map(x => {
      if (did===x.id) {
        return x.name
      }
    })
  }, {
    title: '状态',
    dataIndex: 'status',
    'render': (status) => {
      if (status === 1) {
        return  '没分配'
      } else if (status === 2) {
        return  '已分配'
      } else if (status === 3) {
        return '已报销'
      } else  {
        return '未知状态'
      }
    }
  }, {
    title: '使用者',
    dataIndex: 'userName',
  }, {
    title: '操作',
    width: 400,
    render: (text, record) => (
      <span>
        {
          record.status != 3
          &&
          <Popconfirm title="你确定要报废该资产吗?"  onConfirm={()=>{this.changeStatus(record)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('asset.asset.edit') && <a title="报废资产" ><LockOutlined />报废资产</a>}
          </Popconfirm>
          ||
          <Popconfirm title="你确定要启用该资产吗?"  onConfirm={()=>{this.changeStatus(record)}} onCancel={()=>{this.cancel()}}>
            {hasPermission('asset.asset.edit') && <a title="启用资产" ><UnlockOutlined />启用资产</a>}
          </Popconfirm>

        }
        <Divider type="vertical" />
        {
          hasPermission('asset.asset.edit') &&
          <a onClick={()=>{this.handleEdit(record)}}>
            <EditOutlined style={{fontSize: 16, marginRight: 4, color: '#1890ff'}}/>编辑
          </a>
        }
        <Divider type="vertical" />
        {
          <Popconfirm title="你确定要删除吗?"
                      onConfirm={()=>{this.deleteRecord(record.id)}}
                      onCancel={()=>{this.cancel()}}>
            {hasPermission('asset.asset.del') && <a title="删除" ><DeleteOutlined style={{fontSize: 16, marginRight: 4, color: '#1890ff'}}/>删除</a>}
          </Popconfirm>
        }
      </span>
    ),
  }];



  render() {
    const {visible, detailVisible, importVisible, editCacheData} = this.state;
    const {dcList,roleList, assetList, assetCount,roleDetailList,
      assetLoading } = this.props;
    const addAsset = <Button type="primary" onClick={this.showAddModal} >新增</Button>;
    const importAsset = <Button style={{marginLeft: 20}} type="primary" icon={<ImportOutlined />}
                               onClick={() => this.setState({importVisible: true})}>批量导入</Button>
    const extra = <Row gutter={16}>
      {hasPermission('asset.asset.add') && <Col span={10}>{addAsset}</Col>}
      {hasPermission('asset.asset.import') && <Col span={10}>{importAsset}</Col>}
    </Row>;

    return (
      <div>
        <SearchForm>
          <SearchForm.Item span={6} title="类别">
            <Select
              placeholder="请选择"
              onChange={value => this.state.rid = value}
              style={{ width: '100%' }}
            >
              <Select.Option key="0" value="">
                不限
              </Select.Option>
              {roleList.map(x =>
                <Select.Option key={x.id} value={x.id}>
                  {x.name}
                </Select.Option>)}
            </Select>
          </SearchForm.Item>
          <SearchForm.Item span={4} title="状态">
            <Select
              placeholder="请选择"
              onChange={value => this.state.status = value}
              style={{ width: '100%' }}
            >
              <Select.Option key="0" value="">
                不限
              </Select.Option>
              <Select.Option key="1" value="1">
                未分配
              </Select.Option>
              <Select.Option key="2" value="2">
                已分配
              </Select.Option>
              <Select.Option key="3" value="3">
                已报销
              </Select.Option>
            </Select>
          </SearchForm.Item>
          <SearchForm.Item span={6} title="SN码">
            <Input allowClear  onChange={e => this.state.snCode = e.target.value} placeholder="请输入SN码"/>
          </SearchForm.Item>
          <SearchForm.Item span={4}>
            <Button type="primary" icon={<SyncOutlined />} onClick={this.fetchRecords}>搜索</Button>
          </SearchForm.Item>
        </SearchForm>

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
            <FormItem label="设备编码"
                      name="name"
                      rules={[{ required: false, whitespace: true, message: '请输入自定义设备编码' }]}
            >
              <Input placeholder="设备编码"/>
            </FormItem>
            <FormItem label="型号"
                      name="rid"
                      rules={[{ required: true,  message: '请选择设备型号' }]}
            >
              <Select
                allowClear
                placeholder="选择设备型号"
                style={{ width: '100%' }}
              >
                {roleDetailList.map(x =>
                  <Select.Option key={x.id} value={x.id}>{x.name}</Select.Option>)}
              </Select>
            </FormItem>
            <FormItem label="数据中心"
                      name="did"
                      rules={[{ required: true, message: '请选择数据中心' }]}
            >
              <Select
                placeholder="选择数据中心"
              >
                {dcList.map(x => <Select.Option key={x.id} value={x.id}>{x.name}</Select.Option>)}
              </Select>
            </FormItem>

            <FormItem label="使用者"
                      name="userName"
                      rules={[{ required: false, whitespace: true, message: '请输入使用者名字' }]}
            >
              <Input placeholder="使用者"/>
            </FormItem>

            <FormItem label="SN码"
                      name="sn"
                      rules={[{ required: true, whitespace: true, message: '请输入SN码' }]}
            >
              <Input placeholder="SN码"/>
            </FormItem>

            <FormItem label="MAC地址"
                      name="mac"
                      rules={[{ required: true, whitespace: true, message: '请输入MAC地址' }]}
            >
              <Input placeholder="MAC地址"/>
            </FormItem>

            <FormItem label="采购渠道"
                      name="channel"
                      rules={[{ required: true, whitespace: true, message: '请输入采购渠道' }]}
            >
              <Input placeholder="采购渠道"/>
            </FormItem>

            <FormItem label="采购价格"
                      name="price"
                      rules={[{ required: true, message: '请输入采购价格' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="采购价格"/>
            </FormItem>

            <FormItem label="质保"
                      name="warranty"
                      rules={[{ required: true, message: '请输入质保' }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="质保"/>
            </FormItem>

            <FormItem label="采购日期"
                      name="buyDate"
                      rules={[{ required: true, message: '请输入采购日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="采购日期"
              />
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
            // onRow={(record) => ({
            //   onClick: () => { this.showDetail(record) }
            // })}
            pagination={{
              defaultPageSize: 10,
              showQuickJumper: true,
              total: assetCount,
              showTotal: (total, range) => `第${range[0]}-${range[1]}条 总共${total}条`,
              onChange: this.pageChange
            }}
            columns={this.columns} dataSource={assetList} loading={assetLoading} rowKey="id" />
        </Card>

        { importVisible &&
        <Import onCancel={this.handleCancel} dispatch={this.props.dispatch}/>
        }

        { detailVisible &&
        <AssetDetailPage
          onCancel={this.handleCancel}
          detailItem={this.state.detailItem}/>
        }

      </div>
    );
  }
}


export default AssetPage;
