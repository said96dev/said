import { create } from 'zustand';
import { Project, ProjectImage, Hotspot } from '../types';

interface ProjectState {
  projects: Project[];
  addProject: (name: string) => Project;
  addImageToProject: (projectId: string, imageUrl: string) => void;
  addHotspot: (projectId: string, imageId: string, hotspot: Omit<Hotspot, 'id'>) => void;
  getProject: (projectId: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  
  addProject: (name: string) => {
    const newProject: Project = {
      id: Math.random().toString(36).substring(2),
      name,
      images: []
    };
    
    set(state => ({
      projects: [...state.projects, newProject]
    }));
    
    return newProject;
  },
  
  addImageToProject: (projectId: string, imageUrl: string) => {
    set(state => ({
      projects: state.projects.map(project => {
        if (project.id === projectId) {
          const newImage: ProjectImage = {
            id: Math.random().toString(36).substring(2),
            url: imageUrl,
            hotspots: []
          };
          return {
            ...project,
            images: [...project.images, newImage]
          };
        }
        return project;
      })
    }));
  },
  
  addHotspot: (projectId: string, imageId: string, hotspotData) => {
    const newHotspot: Hotspot = {
      ...hotspotData,
      id: Math.random().toString(36).substring(2)
    };

    set(state => ({
      projects: state.projects.map(project => {
        if (project.id === projectId) {
          console.log(projectId)
          console.log({
            ...project,
            images: project.images.map(image => {
              if (image.id === imageId) {
                return {
                  ...image,
                  hotspots: [...image.hotspots, newHotspot]
                };
              }
              return image;
            })
          });

          return {
            ...project,
            images: project.images.map(image => {
              if (image.id === imageId) {
                return {
                  ...image,
                  hotspots: [...image.hotspots, newHotspot]
                };
              }
              return image;
            })
          };
        }
        return project;
      })
    }));
  },
  
  getProject: (projectId: string) => {
    return get().projects.find(p => p.id === projectId);
  }
}));