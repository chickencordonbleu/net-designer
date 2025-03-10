import { NetworkProject, UpdateNetworkProjectType } from "../types";
import { merge } from "lodash-es";

const STORAGE_KEY = "network_projects";

export async function getNetworkProjects() {
  const projectsJson = localStorage.getItem(STORAGE_KEY);
  if (!projectsJson) {
    return [];
  }
  return JSON.parse(projectsJson) as NetworkProject[];
}

export async function getNetworkProject(id: string) {
  const projects = await getNetworkProjects();

  return projects.find((project) => project.id === id) || null;
}

export async function createNetworkProject({ name }: { name: string }) {
  const projects = await getNetworkProjects();
  const newProject: NetworkProject = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    servers: 10,
    frontendNetwork: {
      networkType: "spine-leaf",
      oversubscriptionRatio: "1:1",
      nicPorts: 2,
      portSpeed: "40G",
    },
    gpuNetwork: {
      networkType: "spine-leaf",
      oversubscriptionRatio: "1:1",
      nicPorts: 4,
      portSpeed: "100G",
    },
  };

  projects.push(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  return newProject;
}

export async function updateNetworkProject(
  updatedProject: UpdateNetworkProjectType
): Promise<NetworkProject | null> {
  const projects = await getNetworkProjects();
  const index = projects.findIndex((p) => p.id === updatedProject.id);
  const currentProject = projects[index];

  if (index === -1) {
    return null;
  }

  currentProject.updatedAt = new Date().toISOString();

  projects[index] = merge(currentProject, updatedProject);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

export async function deleteNetworkProject(id: string) {
  const projects = await getNetworkProjects();
  const filteredProjects = projects.filter((project) => project.id !== id);

  if (filteredProjects.length === projects.length) {
    // No project was removed
    return false;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProjects));
  return true;
}
