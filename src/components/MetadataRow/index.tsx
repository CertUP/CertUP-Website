import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { NftDossier } from '../../interfaces/721';
import ReactJson from 'react-json-view';

import styles from './styles.module.scss';
import { Addition } from '../../interfaces/common/token.interface';

interface MRProps {
  cert: NftDossier;
}

export default function MetadataRow({ cert }: MRProps) {
  return (
    <Row>
      <Col
        md={{
          span: 10,
          offset: 1,
        }}
      >
        <h2 className="mb-4">Certificate Metadata</h2>
        <Row className="mx-4">
          <Col md={6}>
            <h4>Recipient</h4>
            <ul>
              <li>
                {cert.private_metadata.extension.certified_individual?.first_name}{' '}
                {cert.private_metadata.extension.certified_individual?.middle_name
                  ? `${cert.private_metadata.extension.certified_individual?.middle_name} `
                  : null}
                {cert.private_metadata.extension.certified_individual?.last_name}
              </li>
              {cert.private_metadata.extension.certified_individual?.id ? (
                <li>ID: {cert.private_metadata.extension.certified_individual?.id}</li>
              ) : null}

              {cert.private_metadata.extension.certified_individual?.date_of_birth ? (
                <li>
                  Birth Date:{' '}
                  {new Date(
                    cert.private_metadata.extension.certified_individual?.date_of_birth,
                  ).toLocaleDateString()}
                </li>
              ) : null}
            </ul>
          </Col>
          <Col md={6}>
            <h4>Issuers</h4>
            <Row>
              {cert.private_metadata.extension.issuing_organizations?.map((item) => {
                return (
                  <Col xs="auto" key={item.name}>
                    <ul>
                      <li>{item.name}</li>
                      {item.url ? (
                        <li>
                          <a href={item.url} target="_blank" rel="noreferrer">
                            {item.url}
                          </a>
                        </li>
                      ) : null}

                      {item.address ? <li>{item.address}</li> : null}
                    </ul>
                  </Col>
                );
              })}
              {cert.private_metadata.extension.issuing_individuals?.map((item) => {
                return (
                  <Col xs="auto" key={item.name}>
                    <ul>
                      <li>{item.name}</li>
                      {item.company ? <li>{item.company}</li> : null}

                      {item.title ? <li>{item.title}</li> : null}
                    </ul>
                  </Col>
                );
              })}
            </Row>
          </Col>
        </Row>
        <Row className="mx-4 mb-4">
          <Col md={6}>
            <h4>Certificate Details</h4>
            <ul>
              <li>{cert.private_metadata.extension.certificate.name}</li>
              {cert.private_metadata.extension.certificate.cert_type ? (
                <li>{cert.private_metadata.extension.certificate.cert_type}</li>
              ) : null}
              {cert.private_metadata.extension.certificate.cert_number ? (
                <li>
                  Certificate Number: {cert.private_metadata.extension.certificate.cert_number}
                </li>
              ) : null}
              {cert.private_metadata.extension.certificate.issue_date ? (
                <li>
                  Issued:{' '}
                  {new Date(
                    cert.private_metadata.extension.certificate.issue_date,
                  ).toLocaleDateString()}
                </li>
              ) : null}
              {cert.private_metadata.extension.certificate.expire_date ? (
                <li>
                  Expires:{' '}
                  {new Date(
                    cert.private_metadata.extension.certificate.expire_date,
                  ).toLocaleDateString()}
                </li>
              ) : null}
              {cert.private_metadata.extension.description ? (
                <li>Description: {cert.private_metadata.extension.description}</li>
              ) : null}
            </ul>
          </Col>
          {!!(
            cert.private_metadata.extension.additions &&
            cert.private_metadata.extension.additions.length
          ) && (
            <Col md={6}>
              <h4>Additional Details</h4>
              <Row>
                {cert.private_metadata.extension.additions?.map((item: Addition, index: number) => {
                  return (
                    <Col xs="auto" key={`${item.addition_type}-${index}`}>
                      <ul>
                        <li>
                          <b>{item.addition_type}</b>
                        </li>
                        {!!item.value && <li>{item.value}</li>}
                        {!!item.individual && (
                          <>
                            <li>{item.individual.name}</li>
                            {!!item.individual.title && <li>{item.individual.title}</li>}
                            {!!item.individual.company && <li>{item.individual.company}</li>}
                          </>
                        )}
                        {!!item.organization && (
                          <>
                            <li>{item.organization.name}</li>
                            {!!item.organization.url && <li>{item.organization.url}</li>}
                            {!!item.organization.address && <li>{item.organization.address}</li>}
                          </>
                        )}

                        {!!item.details && <li>{item.details}</li>}

                        {/* {item. ? <li>{item.address}</li> : null} */}
                      </ul>
                    </Col>
                  );
                })}
              </Row>
            </Col>
          )}
        </Row>
        <Row>
          <h4 className="mb-0">Raw Metadata</h4>
          <p className={`mx-1 ${styles.accessText}`}>
            The JSON data of your certificate on the blockchain.
          </p>
          <Col className="mx-4 px-4">
            <ReactJson
              src={cert}
              name={`Certificate JSON`}
              collapsed={true}
              displayObjectSize={false}
              displayDataTypes={false}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
