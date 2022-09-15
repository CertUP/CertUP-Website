import React, { ReactElement, ReactNode } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { StepNumber } from '..';
// import cn from 'classnames';
import styles from './styles.module.scss';

export interface Props {
  step: number;
}

export const ProgressBar: React.FC<Props> = (props) => {
  const { step } = props;

  return (
    <Container>
      <Col xs={{ span: 8, offset: 2 }}>
        <Row className="align-items-center">
          <Col xs={2} className={styles.subTitle}>
            <StepNumber highlighted={step === 1 ? true : false}>1</StepNumber>
            <br />
            Create
          </Col>
          <Col>
            <hr />
          </Col>
          <Col xs={2} className={styles.subTitle}>
            <StepNumber highlighted={step === 2 ? true : false}>2</StepNumber>
            <br />
            Payment
          </Col>
          <Col>
            <hr />
          </Col>
          <Col xs={2} className={styles.subTitle}>
            <StepNumber highlighted={step === 3 ? true : false}>3</StepNumber>
            <br />
            Share
          </Col>
        </Row>
      </Col>
    </Container>
  );
};
export default ProgressBar;
