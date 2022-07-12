/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, CUButtonDark, Spacer } from '../../components';
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
  CertupMetadata,
  NftDossier,
  Participant,
  PermitSignature,
  Project,
} from '../../interfaces';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Spinner } from 'react-bootstrap';
import { SecretNetworkClient, Tx } from 'secretjs';
import { toast } from 'react-toastify';
import StepNumber from '../../components/StepNumber';
import { ProgressBar } from '../../components';
import Table from 'react-bootstrap/Table';
import { permissions, allowedTokens, permitName } from '../../utils/loginPermit';
import { Snip721GetTokensResponse } from 'secretjs/dist/extensions/snip721/msg/GetTokens';
import {
  getAllOwnedDossiers,
  queryPermitCertupContract,
  WithPermit,
} from '../../utils/secretJsWrappers';
import ReactJson from 'react-json-view';
import { Extension } from 'secretjs/dist/extensions/snip721/types';

export default function Access() {
  const { Client, ClientIsSigner, Wallet, Address, LoginToken, QueryPermit } = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [certs, setCerts] = useState<NftDossier[]>([]);

  const [accessCode, setAccessCode] = useState<string>('');

  const navigate = useNavigate();
  const location = useLocation();
  //const numCerts = location.state?.num_certificates || undefined;

  useEffect(() => {
    console.log(location.state);
    if (QueryPermit) queryOwnedCerts();
  }, []);

  useEffect(() => {
    if (!QueryPermit || !Client || !Address) return;
    queryOwnedCerts();
  }, [QueryPermit]);

  const queryOwnedCerts = async () => {
    console.log(QueryPermit);

    //@ts-ignore
    const dossiers = await getAllOwnedDossiers(Client, Address, QueryPermit);

    // // query owned token IDs
    // const tokensQuery = {
    //   tokens: {
    //     owner: Address,
    //   },
    // };

    // console.log('Owned Certs Query', tokensQuery);

    // const { token_list } = (await queryPermitCertupContract(
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

    // const response = (await queryPermitCertupContract(
    //   Client as SecretNetworkClient,
    //   dossierQuery,
    //   QueryPermit as PermitSignature,
    // )) as BatchDossierResponse;

    // console.log('owned certs data', response);
    setCerts(dossiers);
    setLoading(false);
  };

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/', { replace: true }); // the current entry in the history stack will be replaced with the new one with { replace: true }
    }
  };

  const handleView = (cert: NftDossier) => {
    navigate(`/access/${cert.token_id}`, { state: { cert: cert } });
  };

  const handleMint = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const toastRef = toast.loading('Transaction Processing...');
    try {
      const mintMsg = {
        mint_nft: {
          keys: [accessCode],
        },
      };

      const result = await Client?.tx.compute.executeContract(
        {
          sender: Address,
          contractAddress: process.env.REACT_APP_CONTRACT_ADDR as string,
          codeHash: process.env.REACT_APP_CONTRACT_HASH as string,
          msg: mintMsg,
        },
        {
          gasLimit: 50_000,
        },
      );
      console.log('Mint Result:', result);
      if (!result) throw new Error('Something went wrong');
      console.log('OK');
      if (result.code) throw new Error(result.rawLog);

      toast.update(toastRef, {
        render: 'Success!',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error: any) {
      toast.update(toastRef, {
        render: error.toString(),
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
      console.error(error);
    }
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Access Certificate</span>
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
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Access Certificate</span>
          </Row>
        </Container>
        <Spacer height={50} />
        <Container>
          <Row className="justify-content-center" style={{ marginBottom: '25px' }}>
            <Col xs={'auto'}>
              <Form>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                  <Form.Label>Access Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="a1b2c3..."
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                  />
                </Form.Group>
              </Form>
              <button className={styles.cancelBtn} onClick={handleMint}>
                Mint
              </button>
            </Col>
          </Row>
          <hr />
          <Row>
            <h2>Your Certificates</h2>
            {loading ? (
              <div
                style={{ height: '10vh' }}
                className="d-flex align-items-center justify-content-center"
              >
                <Spinner animation="border" />
              </div>
            ) : (
              certs.map((cert, index) => {
                console.log('aaa', cert);

                const fakeMedia = [
                  {
                    url: '',
                  },
                ];

                const fakeExtension: CertupExtension = {
                  certificate: {
                    name: 'Hello Certup',
                    cert_type: null,
                    issue_date: '2222-05-31T00:23:03.000Z',
                    expire_date: null,
                    cert_number: '123',
                  },
                  image: undefined,
                  image_data: undefined,
                  external_url: undefined,
                  description: undefined,
                  name: undefined,
                  attributes: undefined,
                  media: fakeMedia,
                  protected_attributes: [],
                };

                if (!cert.private_metadata.extension) {
                  console.log(`replacing extension on ${index}`, cert.private_metadata);
                  cert.private_metadata.extension = fakeExtension;
                } else if (!(cert.private_metadata.extension.media || []).length) {
                  console.log(`replacing media on ${index}`, cert.private_metadata.extension);
                  cert.private_metadata.extension.media = fakeMedia;
                }

                return (
                  <Col
                    md={6}
                    key={`cert-${index}-${cert.token_id}`}
                    style={{ marginBottom: '3rem', minHeight: '300px' }}
                  >
                    <Row className="mb-2">
                      {
                        //@ts-ignore
                        // eslint-disable-next-line prettier/prettier
                        <Image
                          src={(cert.private_metadata?.extension || fakeExtension).media[0].url}
                          fluid={true}
                        />
                      }
                    </Row>
                    <Row className={`justify-content-between mx-1 ${styles.certName}`}>
                      <Col md="auto">{cert.private_metadata.extension.certificate.name}</Col>
                      <Col md="auto">
                        <span
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleView(cert)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleView(cert);
                          }}
                        >
                          View
                        </span>
                      </Col>
                    </Row>
                    {/* <ReactJson
                      src={cert}
                      collapsed={true}
                      displayObjectSize={false}
                      displayDataTypes={false}
                    /> */}
                  </Col>
                );
              })
            )}
          </Row>
        </Container>
      </Layout>
    </>
  );
}
