import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin, MarkersPluginConfig, Marker } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { ProjectImage } from '../types';

interface ImageViewerProps {
  image: ProjectImage;
  isAddingHotspot?: boolean;
  projectId?: string;
  onHotspotPosition?: (longitude: number, latitude: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  isAddingHotspot = false,
  projectId,
  onHotspotPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);
  const [error, setError] = useState(false);
  const { getProject } = useProjectStore();

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || viewerRef.current) return;

      try {
        // Create viewer instance
        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: image.url,
          navbar: ['autorotate', 'zoom', 'fullscreen'],
          defaultZoomLvl: 0,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
          plugins: [
            [MarkersPlugin, {
              markers: image.hotspots?.map(hotspot => ({
                id: hotspot.id,
                position: {
                  yaw: hotspot.longitude,
                  pitch: hotspot.latitude
                },
                html: '<div class="custom-hotspot"></div>',
                anchor: 'center center',
                scale: [1, 1],
                tooltip: {
                  content: 'Click to navigate',
                  position: 'bottom'
                }
              })) || []
            } as MarkersPluginConfig]
          ]
        });

        // Add ready event listener
        viewerRef.current.addEventListener('ready', () => {
          console.log('Viewer is ready');
        });

        if (!mounted) return;

        markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

        // Handle hotspot navigation
        if (projectId) {
          markersPluginRef.current?.addEventListener('select-marker', ({ marker }: { marker: Marker }) => {
            const hotspot = image.hotspots?.find(h => h.id === marker.id);
            if (hotspot) {
              const project = getProject(projectId);
              const targetImage = project?.images.find(img => img.id === hotspot.targetImageId);
              if (targetImage && viewerRef.current) {
                viewerRef.current.setPanorama(targetImage.url, true);
              }
            }
          });
        }

        // Handle hotspot placement
        if (isAddingHotspot && onHotspotPosition) {
          const handleClick = (e: MouseEvent) => {
            if (!viewerRef.current || !markersPluginRef.current) return;

            // Get spherical coordinates from mouse event
            const pos = viewerRef.current.dataHelper?.viewerCoordsToSphericalCoords({
              x: e.clientX,
              y: e.clientY
            });
            if (!pos || typeof pos.yaw !== 'number' || typeof pos.pitch !== 'number') return;

            // Remove existing temporary marker if it exists
            if (markersPluginRef.current.getMarker('temp-marker')) {
              markersPluginRef.current.removeMarker('temp-marker');
            }

            // Add new temporary marker
            markersPluginRef.current.addMarker({
              id: 'temp-marker',
              position: {
                yaw: pos.yaw,
                pitch: pos.pitch
              },
              html: '<div class="custom-hotspot"></div>',
              anchor: 'center center',
              scale: [1, 1]
            });

            onHotspotPosition(pos.yaw, pos.pitch);
          };

          viewerRef.current.addEventListener('click', handleClick);

          return () => {
            if (viewerRef.current) {
              viewerRef.current.removeEventListener('click', handleClick);
            }
          };
        }

      } catch (err) {
        console.error('Error initializing viewer:', err);
        if (mounted) {
          setError(true);
        }
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (markersPluginRef.current) {
        markersPluginRef.current.clearMarkers();
      }
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [image.url, image.hotspots, isAddingHotspot, projectId, onHotspotPosition, getProject]);

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Failed to load 360° image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="h-[400px] w-full rounded-lg overflow-hidden"
      style={{ cursor: isAddingHotspot ? 'crosshair' : 'grab' }}
    />
  );
};

export default ImageViewer;

/* import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { ProjectImage } from '../types';

interface ImageViewerProps {
  image: ProjectImage;
  isAddingHotspot?: boolean;
  projectId?: string;
  onHotspotPosition?: (longitude: number, latitude: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  isAddingHotspot = false,
  projectId,
  onHotspotPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);
  const [error, setError] = useState(false);
  const { getProject } = useProjectStore();

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || viewerRef.current) return;

      try {
        // Create viewer instance
        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: image.url,
          navbar: ['autorotate', 'zoom', 'fullscreen'],
          defaultZoomLvl: 0,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
          plugins: [
            [MarkersPlugin, {
              markers: image.hotspots?.map(hotspot => ({
                id: hotspot.id,
                longitude: hotspot.longitude,
                latitude: hotspot.latitude,
                html: '<div class="custom-hotspot"></div>',
                anchor: 'center center',
                scale: [1, 1],
                tooltip: {
                  content: 'Click to navigate',
                  position: 'bottom'
                }
              })) || []
            }]
          ],
          ready: () => {
            console.log('Viewer is ready');
          }
        });

        if (!mounted) return;

        markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

        // Handle hotspot navigation
        if (projectId) {
          markersPluginRef.current.addEventListener('select-marker', ({ marker }) => {
            const hotspot = image.hotspots?.find(h => h.id === marker.id);
            if (hotspot) {
              const project = getProject(projectId);
              const targetImage = project?.images.find(img => img.id === hotspot.targetImageId);
              if (targetImage && viewerRef.current) {
                viewerRef.current.setPanorama(targetImage.url, {
                  transition: {
                    duration: 1500,
                    blur: true
                  }
                });
              }
            }
          });
        }

        // Handle hotspot placement
        if (isAddingHotspot && onHotspotPosition) {
          const handleClick = (e: any) => {
            if (!viewerRef.current || !markersPluginRef.current) return;

            // Get spherical coordinates from mouse event
            const pos = viewerRef.current.dataHelper?.viewerCoordsToSphericalCoords({
              x: e.clientX,
              y: e.clientY
            });
            if (!pos) return;

            // Remove existing temporary marker if it exists
            if (markersPluginRef.current.getMarker('temp-marker')) {
              markersPluginRef.current.removeMarker('temp-marker');
            }

            // Add new temporary marker
            markersPluginRef.current.addMarker({
              id: 'temp-marker',
              longitude: pos.longitude,
              latitude: pos.latitude,
              html: '<div class="custom-hotspot"></div>',
              anchor: 'center center',
              scale: [1, 1]
            });

            onHotspotPosition(pos.longitude, pos.latitude);
          };

          viewerRef.current.addEventListener('click', handleClick);

          return () => {
            if (viewerRef.current) {
              viewerRef.current.removeEventListener('click', handleClick);
            }
          };
        }

      } catch (err) {
        console.error('Error initializing viewer:', err);
        if (mounted) {
          setError(true);
        }
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (markersPluginRef.current) {
        markersPluginRef.current.clearMarkers();
      }
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [image.url, image.hotspots, isAddingHotspot, projectId, onHotspotPosition, getProject]);

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Failed to load 360° image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="h-[400px] w-full rounded-lg overflow-hidden"
      style={{ cursor: isAddingHotspot ? 'crosshair' : 'grab' }}
    />
  );
};

export default ImageViewer; *//* import React, { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import { AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { ProjectImage } from '../types';

interface ImageViewerProps {
  image: ProjectImage;
  isAddingHotspot?: boolean;
  projectId?: string;
  onHotspotPosition?: (longitude: number, latitude: number) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  image,
  isAddingHotspot = false,
  projectId,
  onHotspotPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);
  const [error, setError] = useState(false);
  const { getProject } = useProjectStore();

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || viewerRef.current) return;

      try {
        // Create viewer instance
        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: image.url,
          navbar: ['autorotate', 'zoom', 'fullscreen'],
          defaultZoomLvl: 0,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: true,
          plugins: [[MarkersPlugin, {
            markers: image.hotspots.map(hotspot => ({
              id: hotspot.id,
              longitude: hotspot.longitude,
              latitude: hotspot.latitude,
              html: '<div class="custom-hotspot"></div>',
              anchor: 'center center',
              scale: [1, 1],
              tooltip: {
                content: 'Click to navigate',
                position: 'bottom'
              }
            }))
          }]]
        });

        // Wait for viewer to be ready
        await new Promise<void>((resolve, reject) => {
          if (!viewerRef.current) return reject();
          viewerRef.current.addEventListener('ready', () => resolve(), { once: true });
          viewerRef.current.addEventListener('error', () => reject(), { once: true });
        });

        if (!mounted) return;

        markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

        // Handle hotspot navigation
        if (projectId) {
          markersPluginRef.current.addEventListener('select-marker', ({ marker }) => {
            const hotspot = image.hotspots.find(h => h.id === marker.id);
            if (hotspot) {
              const project = getProject(projectId);
              const targetImage = project?.images.find(img => img.id === hotspot.targetImageId);
              if (targetImage && viewerRef.current) {
                viewerRef.current.setPanorama(targetImage.url, {
                  transition: {
                    duration: 1500,
                    blur: true
                  }
                });
              }
            }
          });
        }

        // Handle hotspot placement
        if (isAddingHotspot && onHotspotPosition) {
          const handleClick = (e: any) => {
            if (!viewerRef.current || !markersPluginRef.current) return;

            // Get spherical coordinates from mouse event
            const pos = viewerRef.current.dataHelper.viewerCoordsToSphericalCoords({ x: e.data.clientX, y: e.data.clientY });
            if (!pos) return;

            // Remove existing temporary marker
            try {
              markersPluginRef.current.removeMarker('temp-marker');
            } catch (e) {
              // Ignore if marker doesn't exist
            }

            // Add new temporary marker
            markersPluginRef.current.addMarker({
              id: 'temp-marker',
              longitude: pos.longitude,
              latitude: pos.latitude,
              html: '<div class="custom-hotspot"></div>',
              anchor: 'center center',
              scale: [1, 1]
            });

            onHotspotPosition(pos.longitude, pos.latitude);
          };

          viewerRef.current.addEventListener('click', handleClick);
          return () => {
            if (viewerRef.current) {
              viewerRef.current.removeEventListener('click', handleClick);
            }
          };
        }

      } catch (err) {
        console.error('Error initializing viewer:', err);
        if (mounted) {
          setError(true);
        }
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (markersPluginRef.current) {
        try {
          markersPluginRef.current.removeMarker('temp-marker');
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [image.url, isAddingHotspot, projectId]);

  if (error) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto h-8 w-8 mb-2" />
          <p>Failed to load 360° image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="h-[400px] w-full rounded-lg overflow-hidden"
      style={{ cursor: isAddingHotspot ? 'crosshair' : 'grab' }}
    />
  );
};

export default ImageViewer; */