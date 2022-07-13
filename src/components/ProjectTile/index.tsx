import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Project from '../../interfaces/Project';

interface Props {
  projectIn: Project;
  setProjectId: (projectId?: string) => void;
}

export default function ProjectTile({ projectIn, setProjectId }: Props) {
  return (
    <Col md="5">
      <Row>TODO Show Preview</Row>
      <Row>
        <Col>
          <span>{projectIn.project_name}</span>
        </Col>
        <Col>
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
