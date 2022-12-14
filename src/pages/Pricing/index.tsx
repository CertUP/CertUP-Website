// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import triviumLogo from '../../assets/triviumcolor.svg';
import alterLogo from '../../assets/alterlogo.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Prices } from '../../interfaces/common/common.inteface';
import axios from 'axios';

export default function Pricing() {
  const [priceList, setPriceList] = useState<Prices[]>();

  useEffect(() => {
    document.title = `CertUP - Pricing`;

    getPriceList();
  }, []);

  const getPriceList = async () => {
    const url = new URL('/payment', process.env.REACT_APP_BACKEND).toString();
    const {
      data: { price_list },
    } = await axios.get(url);
    console.log('PriceList', price_list);
    setPriceList(price_list);
    return price_list;
  };

  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Pricing</span>
          </Row>
        </Container>

        <Spacer height={50} />

        <Container>
          <Row className="mb-4">
            <Col xs={12} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }} className={styles.infoBox}>
              <Row className="text-center">
                <Col>
                  <h5 className="d-none d-md-block">Number of Certificates</h5>
                  <h5 className="d-md-none">Certificates</h5>
                </Col>
                <Col>
                  <h5 className="d-none d-md-block">Price / Certificate</h5>
                  <h5 className="d-md-none">Price / Cert</h5>
                </Col>
                <hr />
              </Row>
              {priceList?.map((price, index) => {
                let maxCerts;
                if (priceList[index + 1]) {
                  maxCerts = priceList[index + 1].minCerts - 1;
                }
                return (
                  <Row key={`price-${index}`} className="text-center">
                    <Col>
                      <p>
                        {price.minCerts} {maxCerts ? `to ${maxCerts}` : 'or more'}
                      </p>
                    </Col>
                    <Col>
                      <p>${(price.priceUsd / 100).toFixed(2)}</p>
                    </Col>
                  </Row>
                );
              })}
            </Col>
          </Row>
          <Row className="mt-4 text-center">
            <p>
              You can <Link to="/addcredit">purchase certificate credits</Link> in advance to take advantage of our bulk
              pricing.
            </p>
          </Row>
        </Container>

        <Spacer height={120} />
      </Layout>
    </>
  );
}
