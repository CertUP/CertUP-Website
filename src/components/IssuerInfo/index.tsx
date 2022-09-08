import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Project from '../../interfaces/Project';

import styles from './styles.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useProject } from '../../contexts';

import useQuery from '../../hooks/QueryHook';
import { PubIssuerData } from '../../interfaces';

interface Props {
  issuerId: string;
}

export default function IssuerInfo({ issuerId }: Props) {
  const [issuerData, setIssuerData] = useState<PubIssuerData>();

  const { queryPubIssuerData } = useQuery();

  useEffect(() => {
    queryData();
  }, [issuerId]);

  const queryData = async () => {
    //todo handle if this errors
    const response = await queryPubIssuerData(issuerId);
    console.log(response);
    setIssuerData(response);
  };
  if (issuerData?.logo_img_url || issuerData?.name || issuerData?.website || issuerData?.verified)
    return (
      <div>
        <h5>Issued By</h5>
        <Col style={{ marginLeft: '2vw' }}>
          {issuerData.logo_img_url ? (
            <Image
              src={issuerData.logo_img_url}
              fluid
              style={{ maxHeight: '5vh' }}
              className="mb-2"
            />
          ) : null}
          {issuerData.name ? (
            <h5 style={{ fontWeight: '700', marginBottom: '2px', marginLeft: '1vw' }}>
              {issuerData.name}
            </h5>
          ) : null}
          {issuerData.website ? (
            <a href={issuerData.website} style={{ marginLeft: '1vw' }}>
              {issuerData.website}
            </a>
          ) : null}
        </Col>
      </div>
    );
  else return null;
}
