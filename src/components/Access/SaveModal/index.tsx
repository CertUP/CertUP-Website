import React, { useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faDownload } from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import { NftDossier } from '../../../interfaces/721';
import { ModalButton } from '../../ModalButton';
import CUButton from '../../CUButton';
import { decryptFile, ipfsDownload } from '../../../utils/fileHelper';
import { toast } from 'react-toastify';

interface props {
  show: boolean;
  setShow: (a: any) => void;
  metadata: NftDossier;
}

function toDataURL(url: string) {
  return fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      return URL.createObjectURL(blob);
    });
}

async function downloadUrl(url: string, name = 'download', type = 'png') {
  const response = await fetch(url);
  await downloadBlob(await response.blob());
}

async function downloadBlob(blob: Blob, name = 'CertUP Cert Download', type = 'png') {
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = href;
  a.download = `${name}.${type}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(href);
}

const downloadJson = (data: object, fileName = 'CertUP Cert Metadata') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, fileName, 'json');
};

export default function SaveModal({ show, setShow, metadata }: props) {
  const handleClose = () => setShow(false);

  const handleDlImage = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    // const imageUrl = (metadata?.private_metadata?.extension?.media || [])[0].url.replace(
    //   'ipfs.io',
    //   process.env.REACT_APP_IPFS_MIRROR || 'cloudflare-ipfs.com',
    // );
    // download(imageUrl);

    try {
      if (!metadata.private_metadata.extension.media) throw new Error('Media not Found');

      let result = await ipfsDownload(metadata.private_metadata.extension.media[0].url);
      if (metadata.private_metadata.extension.media[0].authentication?.key) {
        result = decryptFile(
          result,
          metadata.private_metadata.extension.media[0].authentication.key,
        );
      }
      console.log('DECRYPT RESULT', result);
      const blob = new Blob([result]);
      downloadBlob(blob, `${metadata.private_metadata.extension.certificate.name} Image`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to Download');
    }
  };

  const handleDlMeta = () => {
    try {
      console.log(metadata);
      downloadJson(metadata, `${metadata.private_metadata.extension.certificate.name} Metadata`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to Download');
    }
  };

  return (
    <Modal show={show} onHide={handleClose} /*size="lg"*/>
      <Modal.Header closeButton>
        <Modal.Title>Save Certificate</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className={`${styles.modalBody} justify-content-center mb-4`}>
          <div style={{ width: '85%' }}>
            Download a copy of your certificate image and metadata. Metadata may contain information
            not displayed in the image.
          </div>
        </Row>
        <Row className="justify-content-center">
          <Col className="mx-1">
            <ModalButton onClick={handleDlImage}>
              <FontAwesomeIcon icon={faDownload} size="2x" />
              <Row className="text-center">
                <span>Download Image</span>
              </Row>
            </ModalButton>
          </Col>

          <Col className="mx-1">
            <ModalButton onClick={handleDlMeta}>
              <FontAwesomeIcon icon={faDownload} size="2x" />
              <Row className="text-center">
                <span>Download Metadata</span>
              </Row>
            </ModalButton>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button variant="secondary" onClick={handleClose}>
          Close
        </Button> */}
        <CUButton btnStyle="default" onClick={handleClose} fill={false} style={{ margin: 0 }}>
          Close
        </CUButton>
      </Modal.Footer>
    </Modal>
  );
}
