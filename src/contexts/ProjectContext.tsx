import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import Project from '../interfaces/Project';
// import { getRandom } from '../utils/helpers';
import { nanoid } from 'nanoid'; // TODO: DELETE HERE IF IT IS NOT NECESSARY
import { useWallet } from '.';
import axios from 'axios';
import { toast } from 'react-toastify';
import { dataURLtoFile } from '../utils/fileHelper';

const projectsUrl = new URL('/projects', process.env.REACT_APP_BACKEND).toString();

export interface ProjectContextState {
  Projects: Project[];
  LoadingProjects: boolean;
  refreshProjects: () => void;
  findProject: (id: string) => Project | undefined;
  addProject: (newProject: Project) => Promise<string>;
  removeProject: (id: string) => void;
  removeAll: () => void;
  updateProject: (id: string, data: Project) => Promise<void>;
}

interface Props {
  children: ReactNode;
}

// set default values for initializing
const contextDefaultValues: ProjectContextState = {
  Projects: [],
  LoadingProjects: true,
  refreshProjects: function (): void {
    throw new Error('Function not implemented.');
  },
  findProject: function (): Project {
    throw new Error('Function not implemented.');
  },
  addProject: async function (): Promise<string> {
    throw new Error('Function not implemented.');
  },
  removeProject: function (): void {
    throw new Error('Function not implemented.');
  },
  removeAll: function (): void {
    throw new Error('Function not implemented.');
  },
  updateProject: async function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const ProjectContext = createContext<ProjectContextState>(contextDefaultValues);

export const ProjectProvider = ({ children }: Props): ReactElement => {
  // set default values
  const [Projects, setProjects] = useState<Project[]>(contextDefaultValues.Projects);
  const [LoadingProjects, setLoading] = useState<boolean>(contextDefaultValues.LoadingProjects);

  const { Address, LoginToken } = useWallet();

  useEffect(() => {
    if (!Address || !LoginToken) return;
    refreshProjects();
  }, [LoginToken, Address]);

  const refreshProjects = async () => {
    console.log('Getting Projects from DB', LoginToken, Address);

    const token = `Permit ${JSON.stringify(LoginToken)}`;
    const url = new URL(`/projects/owner/${Address}`, process.env.REACT_APP_BACKEND);
    const response = await axios.get(url.toString(), {
      headers: {
        Authorization: token,
      },
    });

    const returnedProjects: Project[] = response.data.data;
    console.log('Returned from DB:', returnedProjects);

    const projects: Project[] = [];

    //= response.data.data.map((project: any) => {
    for (let i = 0; i < returnedProjects.length; i++) {
      const project: Project = returnedProjects[i];

      // // convert logo URI into File object
      // if (project.renderProps.company_logo_uri)
      //   project.renderProps.company_logo_file = await dataURLtoFile(project.renderProps.company_logo_uri, 'Saved Image');

      //convert issue date string from DB into Date
      if (project.certInfo.issue_date)
        project.certInfo.issue_date = new Date(project.certInfo.issue_date);
      if (project.certInfo.expire_date)
        project.certInfo.expire_date = new Date(project.certInfo.expire_date);

      // convert participant dob strings from DB to Date
      for (let i = 0; i < project.participants.length; i++) {
        if (project.participants[i].dob)
          project.participants[i].dob = new Date(project.participants[i].dob || '');
      }

      projects.push(project);
    }

    setProjects(projects);
    setLoading(false);
  };

  const addProject = async (newProject: Project) => {
    if (!newProject.project_name) {
      throw new Error("Please enter a 'Project Name'");
      return;
    }

    // add item with new id generated
    setProjects((Projects) => [...Projects, { ...newProject }]);

    const token = `Permit ${JSON.stringify(LoginToken)}`;
    console.log('Saving Project:', newProject);

    const response = await axios.post(projectsUrl, newProject, {
      headers: {
        Authorization: token,
      },
    });

    console.log(response.data.data._id);
    return response.data.data._id;
  };

  // find item by using id value
  const findProject = (id: string): Project | undefined => {
    const data = Projects;

    // find the item's index to remove it
    const project = data.find((Project) => Project._id === id);

    // to check if the item exist in the list
    if (!project) {
      alert('No project found in the list');
      return;
    }

    //return project;
    return new Project(project);
  };

  // remove item by using id value
  const removeProject = (id: string) => {
    const data = Projects;

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
    setProjects([...data]);
  };

  // Firstly, check if there any value exists in the list.
  // If does exist, set item list to an empty array otherwise, give alert to inform user.
  const removeAll = () =>
    Projects.length === 0 ? alert('There are no tasks found in the list!') : setProjects([]);

  // Update item with id and item values.
  const updateProject = async (id: string, project: Project) => {
    if (!project.project_name) {
      throw new Error("Please enter a 'Project Name'");
      return;
    }

    const data = Projects;
    const index = data.findIndex((Project) => Project._id === id);

    // if last save has preview but current doesnt, use last save's preview
    if (!project.lastPreview && data[index].lastPreview)
      project.lastPreview = data[index].lastPreview;

    data[index] = project;
    setProjects([...data]);

    const token = `Permit ${JSON.stringify(LoginToken)}`;

    console.log('Updating Remote Project:', project);

    const url = new URL(`/projects/${project._id}`, process.env.REACT_APP_BACKEND);
    // const remoteProject: RemoteProject = {
    //   ...project,
    //   company_logo: '',
    // };

    const response = await axios.put(url.toString(), project, {
      headers: {
        Authorization: token,
      },
    });
    console.log('Done', response);
  };

  const values = {
    Projects,
    LoadingProjects,
    refreshProjects,
    findProject,
    addProject,
    removeProject,
    removeAll,
    updateProject,
  };

  // add values to provider to reach them out from another component
  return <ProjectContext.Provider value={values}>{children}</ProjectContext.Provider>;
};

// created custom hook
export const useProject = () => useContext(ProjectContext);
