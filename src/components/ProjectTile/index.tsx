import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Project } from '../../interfaces';

interface Props {
  projectIn: Project;
  setProject: (project: Project) => void;
}

export default function ProjectTile({ projectIn, setProject }: Props) {
  console.log(projectIn);
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
            onClick={() => setProject(projectIn)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setProject(projectIn);
            }}
          >
            ✎ Edit Project
          </span>
        </Col>
      </Row>
    </Col>
  );
}
