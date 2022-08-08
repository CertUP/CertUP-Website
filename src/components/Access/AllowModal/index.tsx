import React, { useEffect, useState } from 'react';
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
import { faCircle, faDownload } from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import { NftDossier } from '../../../interfaces';
import { ModalButton } from '../../ModalButton';
import { CUButton } from '../../CUButton';
import useQuery, { Snip721Approval } from '../../../hooks/QueryHook';
import { Spinner } from 'react-bootstrap';

interface props {
  show: boolean;
  setShow: (a: any) => void;
  tokenId: string;
}

export default function AllowModal({ show, setShow, tokenId }: props) {
  const [whitelistAddr, setWhitelistAddr] = useState<string>('');
  const [loadingApprovals, setLoadingApprovals] = useState(false);
  const [whitelist, setWhitelist] = useState<Snip721Approval[]>([]);
  const [allowedAll, setAllowedAll] = useState(false);

  const { queryNFTWhitelist } = useQuery();

  const handleClose = () => setShow(false);

  useEffect(() => {
    checkWhitelist();
  }, [tokenId]);

  const checkWhitelist = async () => {
    setLoadingApprovals(true);
    //query for whitelisted addresses
    const wl = await queryNFTWhitelist(tokenId);
    console.log('wl', wl);
    setWhitelist(wl.token_approvals);
    setAllowedAll(wl.private_metadata_is_public);
    setLoadingApprovals(false);
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
            <Row className="justify-content-center">
              <Col md="auto">
                <CUButton btnStyle="square">Allow All</CUButton>
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
                <CUButton btnStyle="square">Generate Code</CUButton>
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
              className="mb-2"
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
                  //className="mt-1"
                />
              </Form.Group>
            </Form>
            <Row className="justify-content-center">
              <Col md="auto">
                <CUButton btnStyle="square">Allow Address</CUButton>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col className="d-flex flex-column justify-content-between"></Col>

          <Col className="d-flex flex-column justify-content-between"></Col>

          <Col className="d-flex flex-column justify-content-between">
            <Row>
              <h5>Whitelisted Addresses:</h5>
            </Row>
            <Row>
              {loadingApprovals ? (
                <Spinner animation="border" />
              ) : whitelist.length ? (
                <ul>
                  {whitelist.map((wl, i) => {
                    return <li key={`wl-item-${i}`}>{wl.address}</li>;
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
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
