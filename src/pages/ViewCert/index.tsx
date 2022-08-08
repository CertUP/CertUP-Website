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
  CertupExtension,
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
import { FacebookShareButton, LinkedinShareButton, TwitterShareButton } from 'react-share';
import AllowModal from '../../components/Access/AllowModal';

export default function ViewCert() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, QueryPermit } = useWallet();
  const { getCert } = useQuery();

  const [loading, setLoading] = useState<boolean>(true);
  const [cert, setCert] = useState<NftDossier>();

  const navigate = useNavigate();
  const location = useLocation();
  const { tokenid } = useParams();

  const [showSave, setShowSave] = useState(false);
  const [showAllow, setShowAllow] = useState(false);

  useEffect(() => {
    console.log('Passed State', location.state);
    if (location.state?.cert) setCert(location.state.cert);
  }, []);

  useEffect(() => {
    if (!QueryPermit || !Client || !Address || cert) return;
    queryCert();
  }, [QueryPermit]);

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
    if (!Client || !Address || !QueryPermit || !tokenid) return; //todo: handle this better
    console.log('Querying Cert Info');
    //const dossier = await getDossier(Client, Address, QueryPermit, tokenid);
    const dossier = await getCert(tokenid);

    // // query owned token IDs
    // const tokensQuery = {
    //   tokens: {
    //     owner: Address,
    //   },
    // };

    // console.log('Owned Certs Query', tokensQuery);

    // const { token_list } = (await queryPermitNFTContract(
    //   Client as SecretNetworkClient,
    //   tokensQuery,
    //   QueryPermit as PermitSignature,
    // )) as Snip721GetTokensResponse;

    // console.log('owned certs list', token_list.tokens);

    // // query NFT metadata
    // const dossierQuery = {
    //   batch_nft_dossier: {
    //     token_ids: token_list.tokens,
    //   },
    // };

    // const response = (await queryPermitNFTContract(
    //   Client as SecretNetworkClient,
    //   dossierQuery,
    //   QueryPermit as PermitSignature,
    // )) as BatchDossierResponse;

    // console.log('owned certs data', response);
    setCert(dossier);
    setLoading(false);
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
        <AllowModal show={showAllow} setShow={setShowAllow} tokenId={tokenid as string} />
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
                  <Image
                    src={(cert?.private_metadata?.extension?.media || [])[0].url.replace(
                      'ipfs.io',
                      'infura-ipfs.io',
                    )}
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
                </Row>
                <Row className="mt-4">
                  <Col md={{ span: 6, offset: 1 }}>
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
                        <TwitterShareButton url="test">aaa</TwitterShareButton>
                      </Col>
                      <Col>
                        <span>Facebook</span>
                      </Col>
                    </Row>
                    <hr />
                  </Col>
                </Row>
                <Row>
                  <Col md={{ span: 10, offset: 1 }}>
                    <h2>Certificate Metadata</h2>
                    <ReactJson
                      src={cert}
                      name={`Certificate`}
                      collapsed={true}
                      displayObjectSize={false}
                      displayDataTypes={false}
                    />
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
