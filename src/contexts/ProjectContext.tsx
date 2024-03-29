import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import Project, { defaultCertInfo } from '../interfaces/Project';
import { useWallet } from '.';
import axios from 'axios';
import { toast } from 'react-toastify';
import useQuery from '../hooks/QueryHook';
import { ExportProject } from '../interfaces/manager';
import { isExpired } from '../utils/loginPermit';
import { defaultFunction } from '../utils/helpers';
import { useIssuer } from './IssuerContext';

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

export interface ProjectContextState {
  PendingProjects: Project[];
  MintedProjects: ExportProject[];
  LoadingPendingProjects: boolean;
  LoadingMintedProjects: boolean;
  refreshProjects: () => void;
  refreshPendingProjects: () => void;
  refreshMintedProjects: () => void;
  findProject: (id: string) => Project | undefined;
  findMintedProject: (id: string) => ExportProject | undefined;
  addProject: (newProject: Project) => Promise<string>;
  removeProject: (id: string) => void;
  updateProject: (id: string, data: Project) => Promise<void>;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: ProjectContextState = {
  PendingProjects: [],
  LoadingPendingProjects: false,

  MintedProjects: [],
  LoadingMintedProjects: false,

  refreshProjects: defaultFunction,
  refreshPendingProjects: defaultFunction,
  refreshMintedProjects: defaultFunction,
  findProject: function (): Project {
    throw new Error('Function not implemented.');
  },
  findMintedProject: function (): ExportProject {
    throw new Error('Function not implemented.');
  },
  addProject: async function (): Promise<string> {
    throw new Error('Function not implemented.');
  },
  removeProject: defaultFunction,
  updateProject: async function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const ProjectContext = createContext<ProjectContextState>(contextDefaultValues);

export const ProjectProvider = ({ children }: Props): ReactElement => {
  // set default values
  const [PendingProjects, setPendingProjects] = useState<Project[]>(
    contextDefaultValues.PendingProjects,
  );
  const [MintedProjects, setMintedProjects] = useState<ExportProject[]>(
    contextDefaultValues.MintedProjects,
  );
  const [LoadingPendingProjects, setLoadingPending] = useState<boolean>(
    contextDefaultValues.LoadingPendingProjects,
  );
  const [LoadingMintedProjects, setLoadingMinted] = useState<boolean>(
    contextDefaultValues.LoadingMintedProjects,
  );

  const { queryProjects } = useQuery();
  const { Address, LoginToken, QueryPermit, clearToken } = useWallet();
  const { VerifiedIssuer } = useIssuer();

  useEffect(() => {
    if (!Address || !LoginToken || !QueryPermit || !VerifiedIssuer) return;
    refreshPendingProjects();
  }, [Address, LoginToken, VerifiedIssuer]);

  useEffect(() => {
    if (!Address || !QueryPermit || !VerifiedIssuer) return;
    refreshMintedProjects(true);
  }, [Address, QueryPermit, VerifiedIssuer]);

  const refreshProjects = () => {
    refreshPendingProjects();
    refreshMintedProjects(true);
  };

  const refreshPendingProjects = async () => {
    if (!LoginToken || !Address) return;
    if (isExpired(LoginToken)) {
      clearToken();
      return;
    }

    try {
      setLoadingPending(true);

      const token = `Permit ${JSON.stringify(LoginToken)}`;
      const url = new URL(`/projects/owner/${Address}`, process.env.REACT_APP_BACKEND);
      const response = await axios.get(url.toString(), {
        headers: {
          Authorization: token,
        },
      });

      const returnedProjects: Project[] = response.data.data;

      const projects: Project[] = [];

      for (let i = 0; i < returnedProjects.length; i++) {
        const project: Project = returnedProjects[i];
        if (project.certInfo) {
          //convert issue date string from DB into Date
          if (project.certInfo.issue_date)
            project.certInfo.issue_date = new Date(project.certInfo.issue_date);
          else project.certInfo.issue_date = new Date();
          if (project.certInfo.expire_date)
            project.certInfo.expire_date = new Date(project.certInfo.expire_date);
        } else {
          project.certInfo = defaultCertInfo;
        }
        // convert participant dob strings from DB to Date
        for (let i = 0; i < project.participants.length; i++) {
          if (project.participants[i].dob)
            project.participants[i].dob = new Date(project.participants[i].dob || '');
        }

        projects.push(project);
      }

      setPendingProjects(projects);
      setLoadingPending(false);
      return projects;
    } catch (error: any) {
      toast.error('Failed to load pending projects.');
      console.error('Failed to load pending projects:', error);
      setLoadingPending(false);
    }
  };

  const refreshMintedProjects = async (force = false) => {
    // only run one query at a time, no need to send it again if we're already waiting.
    if (LoadingMintedProjects && !force) return;

    setLoadingMinted(true);
    console.log('Getting Minted Projects from Contract');

    const result = await queryProjects();

    if (result) setMintedProjects(result);
    setLoadingMinted(false);
  };

  const addProject = async (newProject: Project) => {
    if (!newProject.project_name) {
      throw new Error("Please enter a 'Project Name'");
      return;
    }

    const token = `Permit ${JSON.stringify(LoginToken)}`;
    console.log('Saving Project:', newProject);

    const response = await axios.post(projectsUrl, newProject, {
      headers: {
        Authorization: token,
      },
    });

    // add item with new id generated
    newProject._id = response.data.data._id;
    setPendingProjects((PendingProjects) => [...PendingProjects, { ...newProject }]);

    console.log('Save New Project Response', response.data.data._id);
    return response.data.data._id;
  };

  const findProject = (id: string): Project | undefined => {
    const data = PendingProjects;
    const project = data.find((Project) => Project._id === id);

    if (!project) {
      return;
    }

    return new Project(project);
  };

  const findMintedProject = (id: string): ExportProject | undefined => {
    const data = MintedProjects;
    const project = data.find((Project) => Project.project_id === id);
    return project;
  };

  const removeProject = (id: string) => {
    const data = PendingProjects;

    // find the item's index to remove it
    const index = data.findIndex((Project) => Project._id === id);

    // to check if the item exist in the list
    if (index < 0) {
      alert('No item found in the list');
      return;
    }

    // splice value found in the index
    data.splice(index, 1);

    // data list will be changed because we are editing on the reference. Therefore, it is enough
    // to spread data values
    setPendingProjects([...data]);
  };

  const updateProject = async (id: string, project: Project) => {
    if (!project.project_name) {
      throw new Error("Please enter a 'Project Name'");
      return;
    }

    const data = PendingProjects;
    const index = data.findIndex((Project) => Project._id === id);

    // if last save has preview but current doesnt, use last save's preview
    if (!project.lastPreview && data[index].lastPreview)
      project.lastPreview = data[index].lastPreview;

    data[index] = project;
    setPendingProjects([...data]);

    const token = `Permit ${JSON.stringify(LoginToken)}`;

    console.log('Updating Remote Project:', project);

    const url = new URL(`/projects/${project._id}`, process.env.REACT_APP_BACKEND);

    const response = await axios.put(url.toString(), project, {
      headers: {
        Authorization: token,
      },
    });
    console.log('Done Updating Remote Project', response);
  };

  const values = {
    PendingProjects,
    MintedProjects,
    LoadingPendingProjects,
    LoadingMintedProjects,
    refreshProjects,
    refreshPendingProjects,
    refreshMintedProjects,
    findProject,
    findMintedProject,
    addProject,
    removeProject,
    updateProject,
  };

  // add values to provider to reach them out from another component
  return <ProjectContext.Provider value={values}>{children}</ProjectContext.Provider>;
};

// created custom hook
export const useProject = () => useContext<ProjectContextState>(ProjectContext);
