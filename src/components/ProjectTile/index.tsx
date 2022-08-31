import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Project from '../../interfaces/Project';

import styles from './styles.module.scss';
import { useEffect, useRef, useState } from 'react';
import { useProject } from '../../contexts';
import { Spinner } from 'react-bootstrap';

interface Props {
  projectIn: Project;
  setProjectIdForm: (projectId?: string) => void;
  setProjectIdReview: (projectId?: string) => void;
}

export default function ProjectTile({ projectIn, setProjectIdForm, setProjectIdReview }: Props) {
  const [minted, setMinted] = useState(false);
  const { findMintedProject, LoadingMintedProjects, MintedProjects } = useProject();

  useEffect(() => {
    checkMinted();
  }, [MintedProjects, LoadingMintedProjects]);

  const checkMinted = async () => {
    const result = findMintedProject(projectIn._id as string);
    if (result) {
      setMinted(true);
    }
  };

  return (
    <Col md={6}>
      <Row className="justify-content-center my-3">
        <Col md="10">
          {projectIn.lastPreview ? (
            <Row className="align-content-center" style={{ height: '235px' }}>
              <Image
                fluid
                src={projectIn.lastPreview}
                style={{ width: 'auto', maxHeight: '100%' }}
              />
            </Row>
          ) : (
            <Row
              className={`align-content-center ${styles.missingImageBox}`}
              style={{ height: '215px' }}
            >
              <Col xs={'auto'}>
                <h5>Preview Not Available</h5>
              </Col>
            </Row>
          )}

          <Row className="text-left">
            <Col>
              <span>{projectIn.project_name}</span>
            </Col>
            {LoadingMintedProjects ? (
              <Col xs={'auto'}>
                <Spinner animation="border" variant="info" size="sm" />
              </Col>
            ) : minted ? (
              <>
                <Col xs={'auto'}>
                  <span style={{ color: 'green' }}>Complete</span>
                </Col>
                <Col xs={'auto'}>
                  <span
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setProjectIdReview(projectIn._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setProjectIdReview(projectIn._id);
                    }}
                  >
                    👁 View Project
                  </span>
                </Col>
              </>
            ) : (
              <Col xs={'auto'}>
                <span
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setProjectIdForm(projectIn._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setProjectIdForm(projectIn._id);
                  }}
                >
                  ✎ Edit Project
                </span>
              </Col>
            )}
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
