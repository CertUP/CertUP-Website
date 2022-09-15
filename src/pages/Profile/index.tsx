/* eslint-disable @typescript-eslint/ban-ts-comment */
// import styles from "./styles.module.scss"
import { CUButton, Spacer } from '../../components';
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
import Project from '../../interfaces/Project';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
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
import { useNft } from '../../contexts/NftContext';
import PreloadImage from '../../components/PreloadImage';
import { CertupExtension } from '../../interfaces/token';
import { RestrictedAccess } from '../../components/RestrictedAccess';
import CUSpinner from '../../components/CUSpinner';
import { Issuer, IssuerData } from '../../interfaces/manager';

export default function Profile() {
  const {
    Client,
    ClientIsSigner,
    Wallet,
    Address,
    LoginToken,
    QueryPermit,
    IssuerProfile,
    VerifiedIssuer,
    LoadingRemainingCerts,
    queryCredits,
    ProcessingTx,
  } = useWallet();

  const [newIssuerData, setNewIssuerData] = useState<Issuer | undefined>(IssuerProfile);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  useEffect(() => {
    document.title = `CertUP - Profile`;
  }, []);

  useEffect(() => {
    if (!newIssuerData) setNewIssuerData(IssuerProfile);
  }, [IssuerProfile]);

  const updateIssuerData = (changedData: any) => {
    setNewIssuerData({
      ...newIssuerData,
      ...changedData,
    });
  };

  const navigate = useNavigate();
  const location = useLocation();

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingUpdate(true);
    const toastRef = toast.loading('Transaction Processing...');
    try {
      const editMsg = {
        edit_issuer: {
          issuer_params: {
            addr: Address,
            ...newIssuerData,
          },
        },
      };

      const result = await Client?.tx.compute.executeContract(
        {
          sender: Address,
          contractAddress: process.env.REACT_APP_MANAGER_ADDR as string,
          codeHash: process.env.REACT_APP_MANAGER_HASH as string,
          msg: editMsg,
        },
        {
          gasLimit: 85_000,
        },
      );
      console.log('Edit Result:', result);
      if (!result) throw new Error('Something went wrong');
      console.log('OK');
      if (result.code) {
        console.log(result);
        throw new Error(result.rawLog);
      }

      toast.update(toastRef, {
        render: 'Success!',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
      queryCredits();
    } catch (error: any) {
      toast.update(toastRef, {
        render: error.toString(),
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
      console.error(error);
    }
    setLoadingUpdate(false);
  };

  if (!Wallet || !Address || !LoginToken)
    return (
      <>
        <Layout>
          <Spacer height={100} />

          <Container>
            <Row>
              <span className={styles.aboutTitle}>Issuer Profile</span>
            </Row>
          </Container>
          <Spacer height={50} />

          <ConnectBanner text="Connect a wallet to edit your profile." issuer={true} />

          <Spacer height={150} />
        </Layout>
      </>
    );
  else if (!VerifiedIssuer)
    return (
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row>
            <span className={styles.aboutTitle}>Issuer Profile</span>
          </Row>
        </Container>
        <Spacer height={50} />

        <RestrictedAccess />

        <Spacer height={150} />
      </Layout>
    );

  return (
    <>
      <Layout>
        <Spacer height={100} />

        <Container>
          <Row className="justify-content-center text-center">
            <Col md={12} lg={8}>
              <span className={styles.aboutTitle}>Issuer Profile</span>
              <p style={{ fontSize: '1.2rem' }}>
                Your issuer profile is included with every certificate you issue. Complete your
                profile to provide the best experience to recipients and viewers.
              </p>
            </Col>
          </Row>
        </Container>
        <Spacer height={50} />
        <Container>
          <Row>
            {LoadingRemainingCerts ? (
              <div
                style={{ height: '10vh' }}
                className="d-flex align-items-center justify-content-center"
              >
                <CUSpinner size="lg" />
              </div>
            ) : (
              <>
                <Row className="justify-content-center">
                  <Col md="auto">
                    <div className={`${styles.largeLabel} mb-2`} style={{ fontWeight: '600' }}>
                      Logo:
                    </div>
                    <Row className="mx-4 text-center">
                      <Image
                        src={newIssuerData?.logo_img_url}
                        fluid
                        style={{ maxHeight: '35vh' }}
                      />
                    </Row>
                  </Col>
                  <Col md="auto">
                    <h6 className={`d-inline ${styles.smallLabel}`}>Address:</h6>{' '}
                    <span className={styles.lineBreak}>{Address}</span>
                    <br />
                    <h6 className={`d-inline ${styles.smallLabel}`}>Issuer ID:</h6>{' '}
                    <span className={styles.lineBreak}>{IssuerProfile?.id}</span>
                    <br />
                    <h6 className={`d-inline ${styles.smallLabel}`}>Certs Issued:</h6>{' '}
                    {IssuerProfile?.cert_num}
                    <br />
                    <h6 className={`d-inline ${styles.smallLabel}`}>Cert Credits:</h6>{' '}
                    {IssuerProfile?.remaining_certs}
                    <br />
                  </Col>
                </Row>
                <Row className={`justify-content-center`}>
                  <Form
                    noValidate
                    //as={Row}
                    className={`justify-content-center ${styles.certupInputForm}`}
                    onSubmit={handleUpdate}
                  >
                    <Col xs={{ span: 12, offset: 0 }} lg={{ span: 8, offset: 2 }}>
                      <Row className="justify-content-center mt-4 pt-4">
                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                          <Row className="mb-4" style={{ width: '100%' }}>
                            <Col
                              style={{ paddingTop: '0vh' }}
                              xs={{ span: 4, offset: 4 }}
                              md={{ span: 2, offset: 1 }}
                            >
                              <Form.Label className={`${styles.largeLabel} mb-0`}>Name</Form.Label>
                            </Col>
                            <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                              <Form.Control
                                required
                                value={newIssuerData?.name}
                                onChange={(e) => {
                                  updateIssuerData({ name: e.target.value });
                                  //setDirty(true);
                                }}
                                type="text"
                                placeholder="Corporate Finance Institute"
                                className="mt-1"
                                disabled={loadingUpdate}
                                //isInvalid={!!errors.projectName}
                              />
                              <Form.Control.Feedback type="invalid">
                                {/* {errors.projectName} */}
                              </Form.Control.Feedback>
                            </Col>
                          </Row>
                        </Form.Group>
                      </Row>

                      <Row className="justify-content-center">
                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                          <Row className="mb-4" style={{ width: '100%' }}>
                            <Col
                              style={{ paddingTop: '0vh' }}
                              xs={{ span: 4, offset: 4 }}
                              md={{ span: 2, offset: 1 }}
                            >
                              <Form.Label className={`${styles.largeLabel} mb-0`}>
                                Website
                              </Form.Label>
                            </Col>
                            <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                              <Form.Control
                                required
                                value={newIssuerData?.website}
                                onChange={(e) => {
                                  updateIssuerData({ website: e.target.value });
                                  //setDirty(true);
                                }}
                                type="text"
                                placeholder="https://cfi.org"
                                className="mt-1"
                                disabled={loadingUpdate}
                                //isInvalid={!!errors.projectName}
                              />
                              <Form.Control.Feedback type="invalid">
                                {/* {errors.projectName} */}
                              </Form.Control.Feedback>
                            </Col>
                          </Row>
                        </Form.Group>
                      </Row>

                      <Row className="justify-content-center">
                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                          <Row className="mb-4" style={{ width: '100%' }}>
                            <Col
                              style={{ paddingTop: '0vh' }}
                              xs={{ span: 4, offset: 4 }}
                              md={{ span: 2, offset: 1 }}
                            >
                              <Form.Label className={`${styles.largeLabel} mb-0`}>
                                Logo URL
                              </Form.Label>
                            </Col>
                            <Col style={{ paddingTop: '0vh' }} xs={12} md={8}>
                              <Form.Control
                                required
                                value={newIssuerData?.logo_img_url}
                                onChange={(e) => {
                                  updateIssuerData({ logo_img_url: e.target.value });
                                  //setDirty(true);
                                }}
                                type="text"
                                placeholder="https://cfi.org/logo.png"
                                className="mt-1"
                                disabled={loadingUpdate}
                                //isInvalid={!!errors.projectName}
                              />
                              <Form.Control.Feedback type="invalid">
                                {/* {errors.projectName} */}
                              </Form.Control.Feedback>
                            </Col>
                          </Row>
                        </Form.Group>
                        <Row className="justify-content-center">
                          <Col xs="auto">
                            <CUButton btnStyle="square" type="submit" disabled={ProcessingTx}>
                              {loadingUpdate ? (
                                <>
                                  <span>Updating Profile</span>&nbsp;
                                  <CUSpinner size="xs" />
                                </>
                              ) : (
                                'Update Profile'
                              )}
                            </CUButton>
                          </Col>
                        </Row>
                      </Row>
                    </Col>
                  </Form>
                </Row>
              </>
            )}
          </Row>
        </Container>
      </Layout>
    </>
  );
}
