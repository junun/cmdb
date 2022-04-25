import React from 'react';
import {Modal, Checkbox, Row, Col, message, Alert} from 'antd';
import styles from './role.css';

class PagePerm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      oldRolePermCount:0,
      temp: [],
      checkedValue: false,
      objPerm: {},
    }
  }

  componentDidMount() {
    this.props.dispatch({ 
      type: 'system/getRolePerm',
      payload: this.props.rid
    }).then(()=> {
      this.setState({
        temp: this.props.rolePermList,
        oldRolePermCount: this.props.rolePermList.length
      });
    });

    this.props.dispatch({ 
      type: 'system/getAllPerm'
    }).then(()=> {
      let mod=this.props.allPermList
      let obj={}
      for (let i = 0; i < mod.length; i++) {
        let key="index"
        let subKey = key + mod[i].id;
        if (mod[i].children && mod[i].children.length) {
          for (let x = 0; x < mod[i].children.length; x++) {
            let keyName = subKey + mod[i].children[x].id;
            let arr = []
            if (mod[i].children[x].children && mod[i].children[x].children.length) {
              for (let y = 0; y < mod[i].children[x].children.length; y++) {
                let tmp = mod[i].children[x].children[y]
                arr.push(tmp.id)
              }
            }
            obj[keyName] = arr;
          }
        }
      }

      this.setState({
        objPerm: obj,
      });
    });
  };

  handleAllCheck = (e, mod, page) => {
    let checked = e.target.checked;
    let tmp = this.state.objPerm;
    let rolePermListTemp = this.state.temp;
    const key = "index" +`${mod}` + `${page}`;
    if (tmp.hasOwnProperty(key)) {
      tmp[key].map((item) => {
        let index = rolePermListTemp.indexOf(item);
        if (checked) {
          if (index === -1 ) {
            // 添加
            rolePermListTemp.push(item)
          }
        } else {
          if (index > -1 ) {
            // 减少
            rolePermListTemp.splice(index, 1);
          }
        }
      });
    } else {
      message.warning('没有找到对应的全局变量，请刷新后重试！');
      return false;
    }

    this.setState({
      temp: rolePermListTemp,
    });
  };

  handlePermCheck = (id) => {
    let tmp   = this.state.temp;
    let index = tmp.indexOf(id);
    if (index > -1) {
      tmp.splice(index, 1)
      this.setState({
        checkedValue: false,
        temp: tmp,
      });
    } else {
      tmp.push(id)
      this.setState({
        temp: tmp,
        checkedValue: true,
      });
    }
  };

  checkPageStatus = (items) => {
    let isAllCheck = true
    items.map((item) => {
      if (!this.state.temp.includes(item.id)) {
        isAllCheck = false
      }
    })
    return isAllCheck
  }

  handlePermOk = () => {
    // const keys = this.state.checkedKeys;
    const keys = this.state.temp;
    if (keys.length > 0 || keys.length !== this.state.oldRolePermCount) {
      const values = {};
      values.id = this.props.rid;
      values.code = keys;
      this.props.dispatch({
        type: 'system/rolePermAdd',
        payload: values,
      });
    } else {
      message.warning('没有内容修改， 请检查。');
      return false;
    }

    this.props.onCancel();
  };

  render() {
    return (
      <Modal
        visible
        width={1000}
        maskClosable={false}
        title="功能权限设置"
        className={styles.container}
        onCancel={this.props.onCancel}
        confirmLoading={this.state.loading}
        onOk={this.handlePermOk}
      >
        <Alert
          closable
          showIcon
          type="info"
          style={{width: 600, margin: '0 auto 20px', color: '#31708f !important'}}
          message="小提示"
          description={[
            <div key="1">功能权限仅影响页面功能，管理发布应用权限请在发布权限中设置。</div>,
            <div key="2">权限更改成功后会强制属于该角色的账户重新登录。</div>
          ]}
        />
        <table border="1" className={styles.table}>
          <thead>
          <tr>
            <th>一级模块</th>
            <th>二级页面</th>
            <th>功能</th>
          </tr>
          </thead>
          <tbody>
          {this.props.allPermList.map(mod => (
            mod.children && mod.children.length && mod.children.map((page, index) => (
              <tr key={page.id}>
                {index === 0 && <td rowSpan={mod.children.length}>{mod.name}</td>}
                <td>
                  <Checkbox
                    checked={page.children && page.children.length && this.checkPageStatus(page.children)}
                    onChange={e => this.handleAllCheck(e, mod.id, page.id)}
                  >
                    {page.name}
                  </Checkbox>
                </td>
                <td>
                  <Row>
                    { page.children && page.children.length && page.children.map(perm => (
                      <Col key={perm.id} span={8}>
                        <Checkbox 
                          checked={this.state.temp.includes(perm.id)}
                          onChange={() => this.handlePermCheck(perm.id)}
                        >
                          {perm.name}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </td>
              </tr>
            ))
          ))}
          </tbody>
        </table>
      </Modal>
    )
  }
}

export default PagePerm
