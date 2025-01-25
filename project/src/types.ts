export interface Project {
  id: string;
  name: string;
  images: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  url: string;
  hotspots: Hotspot[];
}

export interface Hotspot {
  id: string;
  targetImageId: string;
  longitude: number;
  latitude: number;
}