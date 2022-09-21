import React, { useEffect, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';

import Image from 'react-bootstrap/Image';

import styles from './styles.module.scss';

import ChooseFile from '../../assets/ChooseFile.svg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import CsvDropzone from '../CsvDropzone';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faDownload } from '@fortawesome/free-solid-svg-icons';
import Container from 'react-bootstrap/Container';
import { Participant } from '../../interfaces/Project';
import { toast } from 'react-toastify';

interface props {
  show: boolean;
  setShow: (a: any) => void;
  setParticipants: (a: any) => void;
}

export default function CsvModal({ show, setShow, setParticipants }: props) {
  const handleClose = () => setShow(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleParticipants = (data: Participant[]) => {
    setParticipants(data);
    if (data.length > 150) {
      toast.error(
        `Projects are currently limited to 150 participants. Your uploaded ${data.length} participants.`,
      );
      return;
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Upload Participants</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row className={`${styles.modalBody} justify-content-center mb-4`}>
            <div style={{ width: '85%' }}>
              Upload a comma seperated (.csv) or Excel 2007+ (.xlsx) file containing your
              participants. This will delete any existing participants.
            </div>
          </Row>
          <Row className={`${styles.modalBody} justify-content-center mb-2`}>
            <div style={{ width: '75%' }}>
              Your file should contain the following column headings:
              <ul>
                <li>
                  <sup>●</sup>&nbsp;Name
                </li>
                <li>
                  <sup>●</sup>&nbsp;Surname
                </li>
                <li>
                  <sup>●</sup>&nbsp;DOB
                </li>
                <li>
                  <sup>●</sup>&nbsp;CertNum
                </li>
              </ul>
            </div>
            Download our template for an example.
          </Row>
          <Row className="justify-content-center">
            <Col xs="auto" className="mx-2">
              <a href="/ParticipantTemplate.xlsx" style={{ width: '100%' }}>
                <div className={styles.dlContainer}>
                  <FontAwesomeIcon icon={faDownload} size="2x" />
                  <Row className="text-center">
                    <span>Download Template</span>
                  </Row>
                </div>
              </a>
            </Col>

            <Col md="auto" className="mx-2">
              <CsvDropzone setParticipants={handleParticipants} />
            </Col>
          </Row>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
