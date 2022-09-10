import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import CUButton from '../CUButton';
import styles from './styles.module.scss';

//import logo from '../../assets/certup-logo-space.min.svg';
import logo from '../../assets/certup-logo-small.png';
import secretlogo from '../../assets/secret-logo.svg';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export default function Footer() {
  return (
    <div className={styles.footerContainer}>
      <Container>
        <Row>
          <Col md={{ span: 3, offset: 0 }} xs={{ span: 8, offset: 3 }}>
            <Row className="mb-4" style={{ paddingTop: '55px', width: '70%' }}>
              <Image src={logo} fluid={true} />
            </Row>
            <Row className="text-center" style={{ width: '70%' }}>
              <p>© 2022 CertUP</p>
            </Row>
            <Row className={styles.socialsContainer} style={{ width: '70%', fontSize: '24px' }}>
              <Col xs="auto">
                <a
                  href="https://discord.gg/jNZJYBDcZQ"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialLink}
                >
                  <FontAwesomeIcon icon={faDiscord as IconProp} />
                </a>
              </Col>
              <Col xs="auto">
                <a
                  href="https://twitter.com/cert_up"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialLink}
                >
                  <FontAwesomeIcon icon={faTwitter as IconProp} />
                </a>
              </Col>
              <Col xs="auto">
                <a
                  href="https://github.com/CertUP"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialLink}
                >
                  <FontAwesomeIcon icon={faGithub as IconProp} />
                </a>
              </Col>
            </Row>
          </Col>
          <Col md={6} xs={12} className={styles.mainLinkContainer}>
            <Row style={{ paddingTop: '75px' }} className="justify-content-around">
              <Col sm={5} xs={6}>
                <Link to="/">
                  <span className={styles.navItem}>Home</span>
                </Link>
                <div style={{ paddingTop: '30px' }} />

                <Link to="/about">
                  <span className={styles.navItem}>About</span>
                </Link>
                <div style={{ paddingTop: '30px' }} />

                <Link to="/contact">
                  <span className={styles.navItem}>Contact</span>
                </Link>
              </Col>
              <Col sm={5} xs={6}>
                <Link to="/issuers">
                  <span className={styles.navItem}>Issue Certificate</span>
                </Link>
                <div style={{ paddingTop: '30px' }} />

                <Link to="/access" style={{ paddingTop: '30px' }}>
                  <span className={styles.navItem}>Access Certificate</span>
                </Link>
              </Col>
            </Row>
          </Col>
          <Col md={3} xs={12} className="d-flex flex-column justify-content-end align-items-center">
            <div className="d-md-none mt-4 mb-4" />
            <a href="https://scrt.network">
              <Image src="/securedby.png" style={{ height: '75px' }} />
            </a>
            <div className="d-md-none mt-4" />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
