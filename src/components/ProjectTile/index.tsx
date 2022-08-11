import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Project from '../../interfaces/Project';

import styles from './styles.module.scss';

interface Props {
  projectIn: Project;
  setProjectId: (projectId?: string) => void;
}

export default function ProjectTile({ projectIn, setProjectId }: Props) {
  return (
    <Col md="5">
      {projectIn.lastPreview ? (
        <Row className="align-content-center" style={{ height: '215px' }}>
          <Image fluid src={projectIn.lastPreview} style={{ width: 'auto', maxHeight: '100%' }} />
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
        <Col xs={'auto'}>
          <span
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => setProjectId(projectIn._id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setProjectId(projectIn._id);
            }}
          >
            ✎ Edit Project
          </span>
        </Col>
      </Row>
    </Col>
  );
}
