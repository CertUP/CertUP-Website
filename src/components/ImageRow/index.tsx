import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { NftDossier } from '../../interfaces';
import PreloadImage from '../PreloadImage';

interface IRProps {
  cert: NftDossier;
  noTitle?: boolean;
}

export default function ImageRow({ cert, noTitle }: IRProps) {
  return (
    <Row
      style={{
        marginBottom: '3rem',
      }}
    >
      <Col
        md={{
          span: 10,
          offset: 1,
        }}
      >
        <h2>
          {noTitle
            ? 'Certificate Image'
            : (cert.private_metadata || cert.public_metadata)?.extension?.certificate.name ||
              'Certificate Image'}
        </h2>
        <Col
          md={{
            span: 10,
            offset: 1,
          }}
          className="mt-4"
        >
          <PreloadImage // src={(cert?.private_metadata?.extension?.media || [])[0].url.replace(
            //   'ipfs.io',
            //   process.env.REACT_APP_IPFS_MIRROR || 'cloudflare-ipfs.com',
            // )}
            url={(cert.private_metadata?.extension?.media || [])[0]?.url}
            decryptionKey={(cert.private_metadata?.extension?.media || [])[0]?.authentication?.key}
            fluid={true}
          />
        </Col>
      </Col>
    </Row>
  );
}
