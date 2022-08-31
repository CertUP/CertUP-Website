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
import { faCloudArrowUp, faDownload, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import { NftDossier } from '../../../interfaces';
import { ModalButton } from '../../ModalButton';

interface props {
  show: boolean;
  handleClose: () => void;
  handleSave: () => void;
  handleContinue: () => void;
}

export default function SaveExitModal({ show, handleClose, handleSave, handleContinue }: props) {
  //const [files, setFiles] = useState<File[]>([]);

  const saveExit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    handleSave();
    handleContinue();
  };

  const noSave = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    handleContinue();
  };

  return (
    <Modal show={show} onHide={handleClose} /*size="lg"*/>
      <Modal.Header closeButton>
        <Modal.Title>Unsaved Changes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className={`${styles.modalBody} justify-content-center mb-4`}>
          <div style={{ width: '85%' }}>
            Your project has unsaved changes, would you like to save before exiting?
          </div>
        </Row>
        <Row className="justify-content-center">
          <Col className="mx-1">
            <ModalButton onClick={noSave} btnStyle="red">
              <FontAwesomeIcon icon={faTrashCan} size="2x" />
              <Row className="text-center">
                <span>Exit Without Saving</span>
              </Row>
            </ModalButton>
          </Col>

          <Col className="mx-1">
            <ModalButton onClick={saveExit}>
              <FontAwesomeIcon icon={faCloudArrowUp} size="2x" />
              <Row className="text-center">
                <span>Save and Exit</span>
              </Row>
            </ModalButton>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="justify-content-start">
        <Button variant="secondary" onClick={handleClose}>
          Go Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
