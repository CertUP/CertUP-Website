/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { BatchDossierResponse, NftDossier, PermitSignature } from '../../interfaces';
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
import { CertupExtension, CertupMetadata } from '../../interfaces/token';
import MetadataRow from '../../components/MetadataRow';
import ImageRow from '../../components/ImageRow';
import KeplrButton from '../../components/KeplrButton';
import IssuerInfo from '../../components/IssuerInfo';

export default function ViewCert() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, QueryPermit, Querier } = useWallet();
  const { getCert, getCertAccessCode, getCertPub } = useQuery();

  const [loading, setLoading] = useState<boolean>(true);
  const [cert, setCert] = useState<NftDossier>();

  const navigate = useNavigate();
  const location = useLocation();
  const { tokenid } = useParams();
  const [tokenId, setTokenId] = useState(location.state?.tokenId || tokenid);

  const [showSave, setShowSave] = useState(false);
  const [showAllow, setShowAllow] = useState(false);

  const [accessCode, setAccessCode] = useState('');
  const [loadingAccessCode, setLoadingAccessCode] = useState(false);

  const { Dossiers, LoadingNfts, refreshDossiers, findNft } = useNft();

  const [isOwner, setIsOwner] = useState(false);

  const accessUrl = `${window.location.protocol}//${window.location.host}/access/${tokenId}`;

  useEffect(() => {
    console.log('Passed State', location.state);
    if (!tokenId) navigate('/access');
    else queryCert();
  }, [Querier]);

  useEffect(() => {
    if (!QueryPermit || !Querier || !Address) return;
    queryCert();
  }, [QueryPermit]);

  useEffect(() => {
    queryCert();
  }, [Dossiers]);

  // useEffect(()=>{
  //   if (LoadingNfts) return;
  //   if (!Dossiers.length)
  // },[Dossiers,LoadingNfts])

  const handleBack = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    navigate('/access');
  };

  const handleShowSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setShowSave(true);
  };

  const handleShowAllow = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setShowAllow(true);
  };

  const handleAccessCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingAccessCode(true);
    const result = await getCertAccessCode(tokenId, accessCode);
    console.log('Dossier Result', result);
    if (result.display_private_metadata_error) toast.error('Invalid access code.');
    else setCert(result);

    setLoadingAccessCode(false);
  };

  const queryCertPub = async () => {
    if (!Querier || !tokenId) return; //todo: handle this better
    setLoading(true);

    //query without permit
    const pubDossier = await getCertPub(tokenId);
    console.log(pubDossier);
    if (!pubDossier.display_private_metadata_error) setCert(pubDossier);
    setLoading(false);
  };

  const queryCert = async () => {
    if (!Querier || !tokenId) return; //todo: handle this better

    if (!QueryPermit || !Address) {
      queryCertPub();
      return;
    }

    setLoading(true);
    const dossier = findNft(tokenId);
    console.log('Dossier Found', dossier);
    if (dossier) {
      setCert(dossier);
      setIsOwner(true);
    } else {
      //manually query
      const manual = await getCert(tokenId);
      console.log(manual);
      if (!manual.display_private_metadata_error) setCert(manual);
    }

    setLoading(false);
  };

  if (loading || !Querier)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>View Certificate</span>
            </Row>
            <Row>
              <span className={styles.aboutSubTitle}>Loading certificate...</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <Container
            fluid={true}
            className={`${styles.bannerContainer}`}
            style={{ minHeight: '20vh' }}
          >
            {/* <Container style={{height: '100%'}}> */}
            <Row style={{ flexGrow: '1' }} className="justify-content-center">
              <Col xs="auto" className="d-flex align-items-center">
                {' '}
                <Spinner animation="border" variant="info" />
              </Col>
            </Row>
          </Container>

          <Spacer height={150} />
        </Layout>
      </>
    );

  if (!cert)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>View Certificate</span>
            </Row>
            <Row>
              <span className={styles.aboutSubTitle}>This certificate is private.</span>
              <br />
              <span className={styles.aboutSubTitle} style={{ fontSize: '24px' }}>
                Connect an authorized wallet or enter an access code to view.
              </span>
            </Row>
          </Container>
          <Spacer height={50} />

          <Container
            fluid={true}
            className={`${styles.bannerContainer}`}
            style={{ minHeight: '40vh' }}
          >
            {/* <Container style={{height: '100%'}}> */}
            <Row style={{ flexGrow: '1' }} className="justify-content-around">
              <Col md={5} xs={6} className={`${styles.bannerCol} justify-content-around`}>
                <Row>
                  <Row>
                    <span className={styles.bannerTitle}>Authorize with Keplr</span>
                  </Row>
                  <Row>
                    <span className={styles.bannerSubtitle}>
                      Connect a wallet authorized by the certificate holder.
                    </span>
                  </Row>
                  {!loading && !cert && Address && (
                    <Row>
                      <span className={styles.bannerSubtitle} style={{ fontSize: '16px' }}>
                        The connected wallet is not authorized to view this certificate.
                      </span>
                    </Row>
                  )}
                </Row>

                <Row>
                  <Col xs={'auto'} md={{ span: 'auto', offset: 1 }} className="text-end">
                    <KeplrButton />
                    {!Address && (
                      <div className="mt-1">
                        <a
                          href="https://keplr.app"
                          className={`${styles.bannerLink}`}
                          target="blank"
                          rel="noopener noreferrer"
                        >
                          Get Keplr Wallet →
                        </a>
                      </div>
                    )}
                  </Col>
                </Row>
              </Col>

              <Col md={5} xs={6} className={`${styles.bannerCol} justify-content-around`}>
                <Row>
                  <Row>
                    <span className={styles.bannerTitle}>Access Code</span>
                  </Row>
                  <Row>
                    <span className={styles.bannerSubtitle}>
                      Enter the access code provided by the certificate holder.
                    </span>
                  </Row>
                </Row>
                <Row>
                  <Col xs={12} md={{ offset: 1, span: 8 }}>
                    <Form
                      //noValidate
                      //validated={validated}
                      //onSubmit={handleSubmit}
                      className={styles.certupInputForm}
                      //className="mb-2"
                      onSubmit={handleAccessCode}
                    >
                      <Form.Group>
                        <Form.Label className={`${styles.largeLabel} mb-0`}>Access Code</Form.Label>
                        <Form.Control
                          required
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value.trim())}
                          type="text"
                          placeholder="secret1..."
                          style={{ width: '100%' }}
                          className="mb-2"
                          // isInvalid={whitelistAddrErr ? true : false}
                        />
                        {/* <Form.Control.Feedback type="invalid">{whitelistAddrErr}</Form.Control.Feedback> */}
                      </Form.Group>

                      <Row className="justify-content-center">
                        <Col md="auto">
                          <CUButton
                            btnStyle="square"
                            // onClick={handleWhitelist}
                            disabled={loadingAccessCode}
                          >
                            Access{' '}
                            {loadingAccessCode ? (
                              <Spinner animation="border" variant="info" size="sm" />
                            ) : null}
                          </CUButton>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </Col>
            </Row>
            {/* </Container> */}
          </Container>

          <Spacer height={150} />
        </Layout>
      </>
    );
  return (
    <>
      <Layout>
        <SaveModal show={showSave} setShow={setShowSave} metadata={cert as NftDossier} />

        {isOwner ? (
          <AllowModal
            show={showAllow}
            setShow={setShowAllow}
            tokenId={tokenid as string}
            metadata={cert as NftDossier}
          />
        ) : null}

        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>View Certificate</span>
          </Row>
        </Container>
        <Spacer height={50} />
        <Container>
          {location.state?.tokenId ? (
            <Row className="mb-4">
              <Col md={'auto'}>
                <CUButton btnStyle="square" onClick={handleBack}>
                  ← Back to Certificates
                </CUButton>
              </Col>
            </Row>
          ) : null}

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
              <ImageRow cert={cert} />
              <Row>
                {/* <Col md={{ span: 6, offset: 1 }}> */}
                <Row>
                  <Col md={{ span: 6, offset: 1 }}>
                    <Row>
                      <Col>
                        <CUButton onClick={handleShowSave}>Save Certificate</CUButton>
                      </Col>
                      <Col>
                        {isOwner ? (
                          <>
                            <CUButton onClick={handleShowAllow} disabled={!isOwner}>
                              Allow Access
                            </CUButton>

                            <p className={`${styles.accessText} mt-3 ms-3`}>
                              Whitelist a wallet address,
                              <br />
                              or generate an access code. <br />
                              Send the token ID and access code to 3rd party.
                            </p>
                          </>
                        ) : null}
                      </Col>
                    </Row>
                  </Col>
                  <Col md={{ span: 5 }} className="d-flex justify-content-center">
                    <IssuerInfo
                      issuerId={
                        (cert.private_metadata?.extension?.certificate?.issuer_id ||
                          cert.public_metadata?.extension?.certificate?.issuer_id) as string
                      }
                    />
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={{ span: 10, offset: 1 }}>
                    {isOwner ? (
                      <>
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
                      </>
                    ) : null}
                    <Row className="mb-4">
                      <Col>
                        <h5 style={{ display: 'inline', marginRight: '.5rem' }}>
                          Certificate Link
                        </h5>
                        <CopyButton text={accessUrl} />
                        <br />
                        <span className={`${styles.accessText} mx-2`}>{accessUrl}</span>
                      </Col>
                    </Row>

                    <hr />
                  </Col>
                </Row>
                <MetadataRow cert={cert} />
              </Row>
            </>
          )}

          {location.state?.tokenId ? (
            <Row className="mt-4">
              <Col md={'auto'}>
                <CUButton btnStyle="square" onClick={handleBack}>
                  ← Back to Certificates
                </CUButton>
              </Col>
            </Row>
          ) : null}
        </Container>
      </Layout>
    </>
  );
}
