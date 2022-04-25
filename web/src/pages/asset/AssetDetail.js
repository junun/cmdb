import React from 'react';
import { Drawer, Descriptions } from 'antd';

import {timeStringTrans, timeExpiredCheck} from "@/utils/globalTools"

class AssetDetailPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
  }

  render() {
    return (
      <Drawer
        width={550}
        visible
        onClose={() => this.props.onCancel()}
        // title={host.name}
        placement="right"
        // onClose={handleClose}
        // visible={store.detailVisible}
      >
        <Descriptions
          bordered
          size="small"
          labelStyle={{width: 150}}
          title={<span style={{fontWeight: 500}}>基本信息</span>}
          column={1}>
          <Descriptions.Item label="资产编号">{this.props.detailItem.name}</Descriptions.Item>
          <Descriptions.Item label="sn码">{this.props.detailItem.sn}</Descriptions.Item>
          <Descriptions.Item label="使用者">{this.props.detailItem.userName}</Descriptions.Item>
          <Descriptions.Item label="购买日期">{timeStringTrans(this.props.detailItem.buyDate)}</Descriptions.Item>
          <Descriptions.Item label="质保">{this.props.detailItem.warranty}</Descriptions.Item>
          <Descriptions.Item label="是否过保">{timeExpiredCheck(this.props.detailItem.buyDate, this.props.detailItem.warranty) && "否"||"是"}</Descriptions.Item>
        </Descriptions>
      </Drawer>
    );
  }

}

export default AssetDetailPage
