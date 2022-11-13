import React, { FormEvent, FormEventHandler, useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faDownload,
  faPaste,
  faTimesCircle,
  faUnlock,
} from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import { NftDossier } from '../../../interfaces/721';
import { ModalButton } from '../../ModalButton';
import { CUButton } from '../../CUButton';
import useQuery from '../../../hooks/QueryHook';

import useExecute from '../../../hooks/ExecuteHook';
import CopyButton from '../../CopyButton';
import RemoveButton from '../RemoveButton';
import { toast } from 'react-toastify';
import { Bech32 } from 'secretjs';
import { useNft } from '../../../contexts/NftContext';
import { useWallet } from '../../../contexts';
import CUSpinner from '../../CUSpinner';

interface props {
  show: boolean;
  setShow: (a: any) => void;
  tokenId: string;
  metadata: NftDossier;
}

export default function AllowModal({ show, setShow, tokenId, metadata }: props) {
  //const [dossier, setDossier] = useState(metadata);
  const [whitelistAddr, setWhitelistAddr] = useState<string>('');
  const [whitelistAddrErr, setWhitelistAddrErr] = useState<string>('');
  const [loading, setLoading] = useState('');

  const [loadingApprovals, setLoadingApprovals] = useState(false);
  //const [whitelist, setWhitelist] = useState<Snip721Approval[]>([]);
  const [allowedAll, setAllowedAll] = useState(false);

  const [allowButtonStyle, setAllowButtonStyle] = useState<any>({});

  const { queryNFTWhitelist, queryNFTDossier } = useQuery();
  const { generateAccessCode, allowAddressAccess, approveAccessGlobal, revokeAccessGlobal } =
    useExecute();
  const { ProcessingTx } = useWallet();

  const { Dossiers, LoadingNfts, refreshDossiers, findNft } = useNft();

  const handleClose = () => setShow(false);

  const accessUrl = `${window.location.protocol}//${window.location.host}/access/${tokenId}`;

  const findFormErrors = (): boolean => {
    setWhitelistAddrErr('');
    let newError = '';
    try {
      if (!whitelistAddr || !whitelistAddr.length) newError = 'Please enter an address';
      else if (!whitelistAddr.startsWith('secret1'))
        newError = 'Address should be a Secret Network address';
      else if (whitelistAddr.length !== 45) newError = 'Address should be 45 characters long';
      else Bech32.decode(whitelistAddr);
    } catch (error: any) {
      if (error.toString().includes('Invalid checksum')) newError = 'Address is invalid';
      else {
        console.error(error);
        throw error;
      }
    }
    if (newError) {
      setWhitelistAddrErr(newError);
      return true;
    }
    return false;
  };

  useEffect(() => {
    //setDossier(metadata);
    console.log('*DOSSIER*', metadata);
    //checkWhitelist();
  }, [tokenId]);

  const refreshDossier = async () => {
    setLoadingApprovals(true);
    // const newDossier = await queryNFTDossier(tokenId);
    // console.log('newdoss', newDossier);
    // setDossier(newDossier);
    await refreshDossiers();
    setLoadingApprovals(false);
  };

  const checkWhitelist = async () => {
    setLoadingApprovals(true);
    //query for whitelisted addresses
    const wl = await queryNFTWhitelist(tokenId);
    console.log('wl', wl);
    //setWhitelist(wl.token_approvals);
    setAllowedAll(wl.private_metadata_is_public);
    setLoadingApprovals(false);
    console.log(metadata);
  };

  const handleAllowAll = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      setLoading('allowAll');
      e.preventDefault();
      let response;
      console.log(metadata.private_metadata_is_public);
      if (metadata.private_metadata_is_public) response = await revokeAccessGlobal(tokenId);
      else response = await approveAccessGlobal(tokenId);
      console.log(response);
      await refreshDossier();
      setLoading('');
    } catch (error) {
      console.error(error);
      setLoading('');
    }
  };

  const handleGenCode = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      setLoading('genCode');
      e.preventDefault();
      const response = await generateAccessCode({ tokenId });
      console.log(response);
      await refreshDossier();
      setLoading('');
    } catch (error) {
      console.error(error);
      setLoading('');
    }
  };

  const handleWhitelist = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent> | FormEvent<HTMLFormElement>,
  ) => {
    try {
      e.preventDefault();
      if (findFormErrors()) {
        return;
      }
      if (!whitelistAddr) return; //error will be displayed by by form errors

      setLoading('addWhitelist');
      const response = await allowAddressAccess({ tokenId, address: whitelistAddr });
      console.log(response);
      setWhitelistAddr('');
      await refreshDossier();
      setLoading('');
    } catch (error) {
      console.error(error);
      setLoading('');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Allow Access</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col className="d-flex flex-column justify-content-between">
            <Row>
              <h4 className="text-center">Allow All</h4>
              <p>
                Allow anyone to view this certificate. The viewer only needs to visit this
                certificate&apos;s URL.
              </p>
            </Row>
            <Row className="justify-content-center text-center">
              <Col md="auto">
                {metadata?.private_metadata_is_public ? (
                  <p className={styles.unlockedText}>
                    Public Access Unlocked <FontAwesomeIcon icon={faUnlock} />
                  </p>
                ) : null}
                <CUButton btnStyle="square" disabled={ProcessingTx} onClick={handleAllowAll}>
                  {loading === 'allowAll' ? (
                    // <CUSpinner size="xs" />
                    <CUSpinner size="xs" />
                  ) : metadata?.private_metadata_is_public ? (
                    'Revoke Public Access'
                  ) : (
                    'Allow All'
                  )}
                </CUButton>
              </Col>
            </Row>
          </Col>

          <Col className="d-flex flex-column justify-content-between">
            <Row>
              <h4 className="text-center">Access Code</h4>
              <p>
                Generate an access code that can be used to access the certificate. The viewer will
                need to visit this certificate&apos;s URL and enter the code to view the
                certificate.
              </p>
            </Row>
            <Row className="justify-content-center">
              <Col md="auto">
                <CUButton btnStyle="square" onClick={handleGenCode} disabled={ProcessingTx}>
                  {loading === 'genCode' ? <CUSpinner size="xs" /> : 'Generate New Code'}
                </CUButton>
              </Col>
            </Row>
          </Col>

          <Col className="d-flex flex-column justify-content-between">
            <h4 className="text-center">Whitelist a Wallet Address.</h4>
            <p>
              Enter a secret network address to authorize to view this certificate. The viewer will
              need to connect with Keplr wallet to view the certificate.
            </p>
            <Form
              //noValidate
              //validated={validated}
              //onSubmit={handleSubmit}
              //className={styles.certupInputForm}
              //className="mb-2"
              onSubmit={handleWhitelist}
            >
              <Form.Group>
                <Form.Label className={`${styles.largeLabel} mb-0`}>Address</Form.Label>
                <Form.Control
                  required
                  value={whitelistAddr}
                  onChange={(e) => setWhitelistAddr(e.target.value)}
                  type="text"
                  placeholder="secret1..."
                  style={{ width: '100%' }}
                  className="mb-2"
                  isInvalid={whitelistAddrErr ? true : false}
                />
                <Form.Control.Feedback type="invalid">{whitelistAddrErr}</Form.Control.Feedback>
              </Form.Group>

              <Row className="justify-content-center">
                <Col md="auto">
                  <CUButton btnStyle="square" onClick={handleWhitelist} disabled={ProcessingTx}>
                    {loading === 'addWhitelist' ? <CUSpinner size="xs" /> : 'Allow Address'}
                  </CUButton>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="d-flex flex-column justify-content-between"></Col>

          <Col className="d-flex flex-column">
            <Row>
              <h5>Access Codes:</h5>
            </Row>
            <Row>
              {loadingApprovals || !metadata ? (
                <CUSpinner size="md" className="mx-4 mt-1" />
              ) : metadata.token_code_approvals.length ? (
                <ul>
                  {metadata.token_code_approvals.map((wl, i) => {
                    return (
                      <li
                        key={`wl-item-${i}`}
                        className="d-flex justify-content-between"
                        style={{ marginBottom: '.15rem' }}
                      >
                        <Col xs={8}>
                          <span
                            style={{ fontSize: '.9rem', fontFamily: 'Andale Mono, monospace' }}
                            data-private
                          >
                            {wl.code}
                          </span>
                        </Col>

                        <Col xs={'auto'} style={{ alignSelf: 'flex-end' }} className="mx-2">
                          <CopyButton text={wl.code} text2="Code" />
                          <RemoveButton
                            tokenId={tokenId}
                            code={wl.code}
                            refresher={refreshDossier}
                          />
                        </Col>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="mx-2">No access codes.</span>
              )}
            </Row>
          </Col>

          <Col className="d-flex flex-column">
            <Row>
              <h5>Whitelisted Addresses:</h5>
            </Row>
            <Row>
              {loadingApprovals ? (
                <CUSpinner size="md" className="mx-4 mt-1" />
              ) : metadata?.token_approvals && metadata.token_approvals.length ? (
                <ul style={{ padding: '0px 3px' }}>
                  {metadata.token_approvals.map((wl, i) => {
                    return (
                      <li
                        key={`addr-wl-item-${i}`}
                        className="d-flex justify-content-between"
                        style={{ marginBottom: '.15rem' }}
                      >
                        <Col xs={8}>
                          <span
                            style={{ fontSize: '.75rem', fontFamily: 'Andale Mono, monospace' }}
                            data-private
                          >
                            {wl.address}
                          </span>
                        </Col>

                        <Col xs={'auto'} style={{ alignSelf: 'flex-end' }} className="mx-2">
                          <CopyButton text={wl.address} text2="Address" />
                          <RemoveButton
                            tokenId={tokenId}
                            address={wl.address}
                            refresher={refreshDossier}
                          />
                        </Col>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="mx-2">No addresses authorized.</span>
              )}
            </Row>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Row className="justify-content-between align-items-center my-0" style={{ width: '100%' }}>
          <Col xs="auto">
            <h5 className="mb-1 d-inline">Access URL</h5>
            <CopyButton text={accessUrl} />
            <br />
            <span className={`${styles.accessText} mx-2`} data-private>
              {accessUrl}
            </span>
          </Col>
          <Col xs="auto" className="px-0">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
}
