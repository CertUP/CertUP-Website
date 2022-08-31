import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

export const RestrictedAccess = () => {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col className="text-center" md={8} xs={12}>
          <h4>
            <p>
              You are not a verified certificate issuer. Early access is restricted to verified
              issuers. Please <Link to="/contact">Contact Us</Link> for access.
            </p>
          </h4>
        </Col>
      </Row>
    </Container>
  );
};
