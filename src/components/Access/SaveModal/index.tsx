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
import { NftDossier } from '../../../interfaces';
import { ModalButton } from '../../ModalButton';

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

async function download(url: string, name = 'download', type = 'png') {
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = await toDataURL(url);
  a.download = name + '.' + type;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const downloadJson = (data: object) => {
  // create file in browser
  const fileName = 'my-file';
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export default function SaveModal({ show, setShow, metadata }: props) {
  const handleClose = () => setShow(false);
  //const [files, setFiles] = useState<File[]>([]);

  const handleDlImage = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault;
    const imageUrl = (metadata?.private_metadata?.extension?.media || [])[0].url.replace(
      'ipfs.io',
      process.env.REACT_APP_IPFS_MIRROR || 'cloudflare-ipfs.com',
    );
    download(imageUrl);
  };

  const handleDlMeta = () => {
    console.log(metadata);
    downloadJson(metadata);
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
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
