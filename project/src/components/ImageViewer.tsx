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
  isAddingHotspot,
  projectId,
  onHotspotPosition
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);  
  const markersPluginRef = useRef<any | null>(null);
  const [error, setError] = useState(false);
  const { getProject } = useProjectStore();
console.log(image)  
  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || viewerRef.current) return;

      try {
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

        viewerRef.current.addEventListener('ready', () => {
        });

        if (!mounted) return;

        markersPluginRef.current = viewerRef.current.getPlugin(MarkersPlugin);

        if (projectId) {
          markersPluginRef.current?.addEventListener('select-marker', ({ marker }: { marker: Marker }) => {
            const hotspot = image.hotspots?.find(h => h.id === marker.id);
            if (hotspot) {
              const project = getProject(projectId);
              const targetImage = project?.images.find(img => img.id === hotspot.targetImageId);
              if (targetImage && viewerRef.current) {
                viewerRef.current.setPanorama(targetImage.url);
              }
            }
          });
        }

        if (isAddingHotspot && onHotspotPosition) {
          const handleClick = (event: any & { type: "click" }) => {
            if (!viewerRef.current || !markersPluginRef.current) return;
            
            const pos = viewerRef.current.dataHelper?.viewerCoordsToSphericalCoords({
              x: event.data.clientX,
              y: event.data.clientY
            });
            
            if (!pos || typeof pos.yaw !== 'number' || typeof pos.pitch !== 'number') return;

            try {
              // Safely remove existing marker if it exists
              const existingMarker = markersPluginRef.current.getMarkers().find(
                (m: Marker) => m.id === 'new-marker'
              );
              if (existingMarker) {
                markersPluginRef.current.removeMarker('new-marker');
              }

              // Add new marker
              markersPluginRef.current.addMarker({
                id: 'new-marker',
                position: {
                  yaw: pos.yaw,
                  pitch: pos.pitch
                },
                html: '<div class="custom-hotspot"></div>',
                anchor: 'center center',
                scale: [1, 1]
              });

              onHotspotPosition(pos.yaw, pos.pitch);
            } catch (err) {
              console.error('Error handling marker operations:', err);
            }
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
          // Safely clear markers on unmount
          const markers = markersPluginRef.current.getMarkers();
          markers.forEach((marker: Marker) => {
            try {
              markersPluginRef.current.removeMarker(marker.id);
            } catch (err) {
              console.error(`Error removing marker ${marker.id}:`, err);
            }
          });
        } catch (err) {
          console.error('Error clearing markers:', err);
        }
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