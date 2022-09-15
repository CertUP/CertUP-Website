import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Project from '../../interfaces/Project';

import styles from './styles.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useProject } from '../../contexts';

import useQuery from '../../hooks/QueryHook';
import { PubIssuerData } from '../../interfaces/manager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

interface Props {
  issuerId: string;
  title?: string;
  horizontal?: boolean;
}

export default function IssuerInfo({ issuerId, title = 'Issued By', horizontal = false }: Props) {
  const [issuerData, setIssuerData] = useState<PubIssuerData>();

  const { queryPubIssuerData } = useQuery();

  useEffect(() => {
    if (!issuerId) return;
    queryData();
  }, [issuerId]);

  const queryData = async () => {
    //todo handle if this errors
    const response = await queryPubIssuerData(issuerId);
    setIssuerData(response);
  };
  if (issuerData?.logo_img_url || issuerData?.name || issuerData?.website || issuerData?.verified)
    return (
      <div>
        <h5 className={horizontal ? 'text-center' : undefined}>{title}</h5>
        <Row>
          <Col xs={horizontal ? 6 : 12} className={horizontal ? 'text-center' : undefined}>
            {!!issuerData.logo_img_url && (
              <Image
                src={issuerData.logo_img_url}
                fluid
                style={{ maxHeight: horizontal ? '10vh' : '5vh' }}
                className="mb-2"
              />
            )}
          </Col>
          <Col xs={horizontal ? 6 : 12}>
            {!!issuerData.name && (
              <h5 style={{ fontWeight: '700', marginBottom: '2px' }}>{issuerData.name}</h5>
            )}
            {!!issuerData.website && <a href={issuerData.website}>{issuerData.website}</a>}
            {issuerData.verified && (
              <OverlayTrigger
                placement={'top'}
                overlay={
                  <Tooltip id={`tooltip-${'top'}`}>
                    <strong>Verfied by CertUP</strong>
                    <br />
                    Verified as: {issuerData.verified_name || 'Name not set, please contact CertUP'}
                  </Tooltip>
                }
              >
                <h6 style={{ marginTop: '5px', display: 'table' }}>✅ Verified</h6>
              </OverlayTrigger>
            )}
          </Col>
        </Row>
      </div>
    );
  else return null;
}
