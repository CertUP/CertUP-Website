/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, SaveModal, Spacer } from '../../components';
import Layout from '../../components/Layout';
import CertUpButton from '../../components/CUButton';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styles from './styles.module.scss';
import exampleCert from '../../assets/ExampleCert.svg';
import { useWallet } from '../../contexts';
import ConnectBanner from '../../components/ConnectBanner';
import ProjectList from '../../components/ProjectList';
import { useEffect, useState } from 'react';
import ProjectForm from '../../components/ProjectForm';
import {
  BatchDossierResponse,
  NftDossier,
  PermitSignature,
} from '../../interfaces';
import Project from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Form, Spinner } from 'react-bootstrap';
import { SecretNetworkClient, Tx } from 'secretjs';
import { toast } from 'react-toastify';
import StepNumber from '../../components/StepNumber';
import { ProgressBar } from '../../components';
import Table from 'react-bootstrap/Table';
import { permissions, allowedTokens, permitName } from '../../utils/loginPermit';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import ReactJson from 'react-json-view';
import { Extension } from 'secretjs/dist/extensions/snip721/types';
import useQuery from '../../hooks/QueryHook';
import {
  FacebookShareButton,
  LinkedinShareButton,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';
import AllowModal from '../../components/Access/AllowModal';
import { useNft } from '../../contexts/NftContext';
import PreloadImage from '../../components/PreloadImage';
import CopyButton from '../../components/CopyButton';

export default function ViewCert() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, QueryPermit, Querier } = useWallet();
  const { getCert } = useQuery();

  const [loading, setLoading] = useState<boolean>(true);
  const [cert, setCert] = useState<NftDossier>();

  const navigate = useNavigate();
  const location = useLocation();
  const { tokenid } = useParams();
  const [tokenId, setTokenId] = useState(location.state?.tokenId || tokenid);

  const [showSave, setShowSave] = useState(false);
  const [showAllow, setShowAllow] = useState(false);

  const { Dossiers, LoadingNfts, refreshInventory, refreshDossiers, findNft } = useNft();

  useEffect(() => {
    console.log('Passed State', location.state);
    if (!tokenId) {
      navigate('/access');
    } else queryCert();
  }, []);

  useEffect(() => {
    if (!QueryPermit || !Querier || !Address) return;
    queryCert();
  }, [QueryPermit]);

  useEffect(() => {
    queryCert();
  }, [Dossiers]);

  const handleBack = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault;
    navigate('/access');
  };

  const handleShowSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault;
    setShowSave(true);
  };

  const handleShowAllow = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault;
    setShowAllow(true);
  };

  const queryCert = async () => {
    if (!Querier || !Address || !QueryPermit || !tokenId) return; //todo: handle this better
    if (!Dossiers.length) await refreshDossiers();

    const dossier = findNft(tokenId);
    console.log('Dossier Found', dossier);
    if (dossier) setCert(dossier);
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>View Certificate</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <ConnectBanner />

          <Spacer height={150} />
        </Layout>
      </>
    );
  return (
    <>
      <Layout>
        <SaveModal show={showSave} setShow={setShowSave} metadata={cert as NftDossier} />
        <AllowModal
          show={showAllow}
          setShow={setShowAllow}
          tokenId={tokenid as string}
          metadata={cert as NftDossier}
        />
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>View Certificate</span>
          </Row>
        </Container>
        <Spacer height={50} />
        <Container>
          <Row className="mb-4">
            <Col md={'auto'}>
              <CUButton btnStyle="square" onClick={handleBack}>
                ← Back to Certificates
              </CUButton>
            </Col>
          </Row>
          {!cert ? (
            <Row>
              <div
                style={{ height: '10vh' }}
                className="d-flex align-items-center justify-content-center"
              >
                <Spinner animation="border" />
              </div>
            </Row>
          ) : (
            <>
              <Row style={{ marginBottom: '3rem' }}>
                <Col md={{ span: 8, offset: 2 }}>
                  <h2>{(cert?.private_metadata || cert?.public_metadata)?.extension?.name}</h2>
                  <PreloadImage
                    // src={(cert?.private_metadata?.extension?.media || [])[0].url.replace(
                    //   'ipfs.io',
                    //   process.env.REACT_APP_IPFS_MIRROR || 'cloudflare-ipfs.com',
                    // )}
                    url={(cert?.private_metadata?.extension?.media || [])[0]?.url}
                    decryptionKey={(cert?.private_metadata?.extension?.media || [])[0]?.authentication?.key}
                    fluid={true}
                  />
                </Col>
              </Row>
              <Row>
                {/* <Col md={{ span: 6, offset: 1 }}> */}
                <Row>
                  <Col md={{ span: 6, offset: 1 }}>
                    <Row>
                      <Col>
                        <CUButton onClick={handleShowSave}>Save Certificate</CUButton>
                      </Col>
                      <Col>
                        <CUButton onClick={handleShowAllow}>Allow Access</CUButton>
                        <p className={`${styles.accessText} mt-3 ms-3`}>
                          Whitelist a wallet address,
                          <br />
                          or generate an access code. <br />
                          Send the token ID and access code to 3rd party.
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col md={{span: 5}}>
                    <span>Issued By</span>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={{ span: 10, offset: 1 }}>
                    <hr />
                    <Row className="mb-2">
                      <h2>Share on Social Media</h2>
                    </Row>
                    <Row style={{ marginBottom: '3rem' }}>
                      <Col>
                        <span>LinkedIn</span>
                      </Col>
                      <Col>
                        <span>Twitter</span>
                        <TwitterShareButton url="test">
                          <TwitterIcon size={32} round={false} />
                        </TwitterShareButton>
                      </Col>
                      <Col>
                        <span>Facebook</span>
                      </Col>
                      <Col>
                        <span>Email</span>
                      </Col>

                    </Row>
                    <Row className="mb-4">
                      <Col>
                        <h5 style={{display: 'inline', marginRight: '.5rem'}}>Certificate Link</h5><CopyButton text={`https://certup.net/access/${cert.token_id}`}/><br />
                        <span className={`${styles.accessText} mx-2`}>https://certup.net/access/{cert.token_id}</span>
                      </Col>
                    </Row>

                    <hr />
                  </Col>
                </Row>
                <Row>
                  <Col md={{ span: 10, offset: 1 }}>
                    <h2 className="mb-4">Certificate Metadata</h2>
                    <Row className="mx-4">
                      <Col md={6}>
                          <h4>Recipient</h4>
                          <ul>
                            <li>
                            {cert.private_metadata.extension.certified_individual?.first_name} {cert.private_metadata.extension.certified_individual?.middle_name} {cert.private_metadata.extension.certified_individual?.last_name}

                            </li>
                          { cert.private_metadata.extension.certified_individual?.id ? <li>ID: {cert.private_metadata.extension.certified_individual?.id}</li> : null }

                          { cert.private_metadata.extension.certified_individual?.date_of_birth ? <li>Birth Date: {(new Date(cert.private_metadata.extension.certified_individual?.date_of_birth).toLocaleDateString())}</li> : null }
                            
                          </ul>
                      </Col>
                      <Col md={6}>
                        <h4>Issuers</h4>
                        <Row>
                        {cert.private_metadata.extension.issuing_organizations?.map(item=>{
                              return (
                                <Col xs="auto" key={item.name}>
                                  <ul>
                                    <li>
                                      {item.name}
                                    </li>
                                    {item.url ? <li><a href={item.url}>{item.url}</a></li> : null }

                                    {item.address ? <li>{item.address}</li> : null }
                                  </ul>
                                </Col>
                              )
                          })}
                            {cert.private_metadata.extension.issuing_individuals?.map(item=>{
                              return (
                                <Col xs="auto" key={item.name}>
                                  <ul>
                                    <li>
                                      {item.name}
                                    </li>
                                    {item.company ? <li>{item.company}</li> : null }

                                    {item.title ? <li>{item.title}</li> : null }
                                  </ul>
                                </Col>
                              )
                          })}
                        </Row>
                      </Col>
                    </Row>
                    <Row className="mx-4 mb-4">
                          <Col md={6}>
                            <h4>Certificate Details</h4>
                            <ul>
                              <li>
                                {cert.private_metadata.extension.certificate.name}
                              </li>
                              {cert.private_metadata.extension.certificate.cert_type ? <li>{cert.private_metadata.extension.certificate.cert_type}</li> : null }
                              {cert.private_metadata.extension.certificate.cert_number ? <li>Certificate Number: {cert.private_metadata.extension.certificate.cert_number}</li> : null }
                              {cert.private_metadata.extension.certificate.issue_date ? <li>Issued: {new Date(cert.private_metadata.extension.certificate.issue_date).toLocaleDateString()}</li> : null }
                              {cert.private_metadata.extension.certificate.expire_date ? <li>Expires: {new Date(cert.private_metadata.extension.certificate.expire_date).toLocaleDateString()}</li> : null }
                              {cert.private_metadata.extension.description ? <li>Description: {cert.private_metadata.extension.description}</li> : null }
                            </ul>
                          </Col>
                        </Row>
                        <Row>
                          <h4 className="mb-0">Raw Metadata</h4>
                          <p className={`mx-1 ${styles.accessText}`}>The JSON data of your certificate on the blockchain.</p>
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
              </Row>
            </>
          )}
          <Row className="mt-4">
            <Col md={'auto'}>
              <CUButton btnStyle="square" onClick={handleBack}>
                ← Back to Certificates
              </CUButton>
            </Col>
          </Row>
        </Container>
      </Layout>
    </>
  );
}
