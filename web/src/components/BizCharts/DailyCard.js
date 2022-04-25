import React, {Fragment, PureComponent} from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Col, Row } from "antd";
import styles from './DailyCard.less'

class DailyCard extends PureComponent {
  render() {
    const {loading, title, detail, value, suffix, hRate, tRate } = this.props;
    let hRateComponent, tRateComponent;
    if (hRate) {
      hRateComponent = <Fragment>
        <span className={styles.dailyCardRate}>环比</span>&nbsp;
        {hRate >= 0 ?
          <span className={styles.dailyCardRateUp}><ArrowUpOutlined /> {hRate}%</span>
          :
          <span className={styles.dailyCardRateDown}><ArrowDownOutlined /> {hRate}%</span>
        }
        &nbsp;&nbsp;
      </Fragment>;
    }
    if (tRate) {
      tRateComponent = <Fragment>
        <span className={styles.dailyCardRate}>同比</span>&nbsp;
        {tRate >= 0 ?
          <span className={styles.dailyCardRateUp}><ArrowUpOutlined /> {tRate}%</span>
          :
          <span className={styles.dailyCardRateDown}><ArrowDownOutlined /> {tRate}%</span>
        }
      </Fragment>;
    }
    return <Card loading={loading}>
      <Row>
        <Col>
          <span className={styles.dailyCardTitle}>{title}（{suffix}）</span>
        </Col>
      </Row>
      <Row>
        <Col>
          <span className={styles.dailyCardDetail}>{detail}</span>
        </Col>
      </Row>
      <Row>
        <Col>
          <span className={styles.dailyCardValue}>{value}</span> <span className={styles.dailyCardValueSuffix}>{suffix}</span>
        </Col>
      </Row>
      <Row>
        <Col>
          {hRateComponent}
          {tRateComponent}
        </Col>
      </Row>
    </Card>;
  }
}

export default DailyCard;
