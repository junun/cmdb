import React from 'react';
import styles from './index.module.css';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';

class BasicSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }


  render() {
    return (
      <React.Fragment>
        <div className={styles.title}>基本设置</div>
      </React.Fragment>
    )
  }
}
export default Form.create()(BasicSetting)
