import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import styles from './styles.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faX } from '@fortawesome/free-solid-svg-icons';
import { useWallet } from '../../../contexts';
import { useIssuer } from '../../../contexts/IssuerContext';
import useQuery from '../../../hooks/QueryHook';
import { useScrollbarWidth } from '../../../hooks/ScroolbarWidthHook';
import { Issuer } from '../../../interfaces/manager';
import ProfileWidget from '../IssuerProfileWidget';
import AddCertsWidget from '../AddCertsWidget';
import TemplateAccessWidget from '../TemplateAccessWidget';

interface ViewerProps {
  issuerList: Issuer[];
  refresh: any;
}

export default function IssuerViewer({ issuerList, refresh }: ViewerProps) {
  const scrollBarWidth = useScrollbarWidth();
  const [selectedIssuer, setSelectedIssuer] = useState<number>(0);

  return (
    <>
      {/* {loading && (
        <Container>
          <Row className="justify-content-center mb-4">
            <Col xs="auto" className="text-center">
              <CUSpinner size="lg" />
              <h3>Loading Project Details</h3>
            </Col>
          </Row>
        </Container>
      )} */}
      <Container fluid="md">
        <Table
          striped
          bordered
          hover
          // responsive
          className={styles.fixed_header}
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <thead>
            <tr>
              <th style={{ width: '30%' }} className="d-none d-md-table-cell">
                Issuer
              </th>
              <th style={{ width: '40%' }}>
                Address
                <br />
                ID
              </th>
              <th style={{ width: '10%' }}># Issued</th>
              <th style={{ width: '10%' }}># Credits</th>
              <th className="d-none d-md-table-cell" style={{ width: '10%' }}>
                Verified
              </th>
              <th style={{ width: scrollBarWidth }}></th>
            </tr>
          </thead>
          <tbody className={styles.reviewTable}>
            {issuerList.map((issuer: Issuer, index: number) => {
              const selected = index === selectedIssuer ? true : false;
              return (
                <tr
                  key={`issuer-row-${index}-${issuer.id}`}
                  className={selected ? styles.selectedRow : styles.unselectedRow}
                  onClick={() => setSelectedIssuer(index)}
                >
                  <td style={{ width: '30%', wordWrap: 'break-word' }} className="d-none d-md-table-cell">
                    {issuer.name}
                  </td>
                  <td style={{ width: '40%', overflow: 'hidden' }}>
                    {issuer.addr}
                    <br />
                    {issuer.id}
                  </td>
                  <td className={styles.claimedCell}>{issuer.cert_num}</td>

                  <td className={styles.claimedCell}>{issuer.remaining_certs}</td>

                  {issuer.verified ? (
                    <td
                      className={styles.claimedCell}
                      style={{
                        color: 'green',
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </td>
                  ) : (
                    <td
                      className={styles.claimedCell}
                      style={{
                        color: 'red',
                      }}
                    >
                      <FontAwesomeIcon icon={faX} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>

        {selectedIssuer && (
          <Row>
            <Col md={6} xs={12}>
              <ProfileWidget issuerProfile={issuerList[selectedIssuer]} refresh={refresh} />
            </Col>
            <Col md={6} xs={12}>
              <Row className="mb-4">
                <AddCertsWidget issuerProfile={issuerList[selectedIssuer]} refresh={refresh} />
              </Row>
              <Row>
                <TemplateAccessWidget issuerProfile={issuerList[selectedIssuer]} refresh={refresh} />
              </Row>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}
