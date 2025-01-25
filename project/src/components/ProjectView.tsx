import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import ImageViewer from './ImageViewer';
import UploadArea from './UploadArea';
import ImageSelector from './ImageSelector';
import { Plus } from 'lucide-react';

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, addImageToProject } = useProjectStore();
  const [showUpload, setShowUpload] = useState(false);
  const [addingHotspot, setAddingHotspot] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [pendingHotspot, setPendingHotspot] = useState<{
    longitude: number;
    latitude: number;
  } | null>(null);
  
  const project = getProject(projectId!);

  if (!project) {
    return <div>Project not found</div>;
  }

  const mainImage = project.images[0];
  const otherImages = project.images.slice(1);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addImageToProject(projectId!, e.target.result as string);
        setShowUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHotspotPosition = (longitude: number, latitude: number) => {
    setPendingHotspot({ longitude, latitude });
    setShowImageSelector(true);
  };

  const handleHotspotComplete = () => {
    setAddingHotspot(false);
    setPendingHotspot(null);
    setShowImageSelector(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Image
          </button>
          {project.images.length >= 2 && !addingHotspot && (
            <button
              onClick={() => setAddingHotspot(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Add Hotspot
            </button>
          )}
          {addingHotspot && (
            <button
              onClick={() => {
                setAddingHotspot(false);
                setPendingHotspot(null);
                setShowImageSelector(false);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel Hotspot
            </button>
          )}
        </div>
      </div>

      {showUpload && (
        <div className="mb-8">
          <UploadArea onFileSelect={handleFileSelect} />
        </div>
      )}

      {/* Main Image */}
      {mainImage && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Main View</h2>
          <ImageViewer
            image={mainImage}
            isAddingHotspot={addingHotspot}
            onHotspotPosition={handleHotspotPosition}
            projectId={projectId!}
          />
        </div>
      )}

      {/* Other Images Grid */}
      {otherImages.length > 0 && !addingHotspot && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Connected Views</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherImages.map((image) => (
              <div key={image.id} className="relative">
                <ImageViewer
                  image={image}
                  isAddingHotspot={false}
                  projectId={projectId!}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Selector Dialog */}
      {showImageSelector && pendingHotspot && (
        <ImageSelector
          images={otherImages}
          onSelect={(targetImageId) => {
            if (mainImage) {
              useProjectStore.getState().addHotspot(
                projectId!,
                mainImage.id,
                {
                  targetImageId,
                  longitude: pendingHotspot.longitude,
                  latitude: pendingHotspot.latitude
                }
              );
              handleHotspotComplete();
            }
          }}
          onClose={() => {
            setShowImageSelector(false);
            setPendingHotspot(null);
          }}
        />
      )}

      {project.images.length === 0 && !showUpload && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No images yet. Click "Add Image" to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectView;