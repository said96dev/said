import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProjectStore } from '../store/projectStore';
import ImageViewer from './ImageViewer';
import UploadArea from './UploadArea';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { ProjectImage } from '../types';

const ProjectView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, addImageToProject, addHotspot } = useProjectStore();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [targetImage, setTargetImage] = useState<ProjectImage | null>(null);

  
  const project = getProject(projectId!);
  console.log("🚀 ~ project:", selectedImage) 

  if (!project) {
    return <div>Project not found</div>;
  }

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        try {
          const img = new Image();
          img.onload = () => {
            addImageToProject(projectId!, e.target!.result as string);
            setShowUpload(false);
          };
          img.onerror = () => {
            setUploadError('Failed to load image. Please try another file.');
          };
          img.src = e.target.result as string;
        } catch (err) {
          setUploadError('Failed to process image. Please try another file.');
        }
      }
    };
    
    reader.onerror = () => {
      setUploadError('Failed to read file. Please try again.');
    };
    
    reader.readAsDataURL(file);
  };

  const handleHotspotPosition = (longitude: number, latitude: number) => {
    if (selectedImage && targetImage) {
      addHotspot(projectId!, selectedImage.id, {
        targetImageId: targetImage.id,
        longitude,
        latitude
      });
      setIsAddingHotspot(false);
      setSelectedImage(targetImage);
      setTargetImage(null);
    }
  };

  const startAddingHotspot = () => {
    setIsAddingHotspot(true);
    setTargetImage(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add Image
          </button>
          {selectedImage && !isAddingHotspot && project.images.length >= 2 && (
            <button
              onClick={startAddingHotspot}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <LinkIcon size={20} />
              Add Hotspot
            </button>
          )}
          {isAddingHotspot && !targetImage && (
            <div className="text-sm text-gray-600">
              Select a target panorama from the list →
            </div>
          )}
          {isAddingHotspot && targetImage && (
            <div className="text-sm text-gray-600">
              Drag the hotspot to position it, then click to place
            </div>
          )}
          {isAddingHotspot && (
            <button
              onClick={() => {
                setIsAddingHotspot(false);
                setTargetImage(null);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidde flex-row-reverse">
        {/* Main Panorama View */}
        <div className="flex-1 p-4">
          {selectedImage ? (
            <ImageViewer
              image={selectedImage} 
              isAddingHotspot={isAddingHotspot && targetImage !== null}
              projectId={projectId}
              onHotspotPosition={handleHotspotPosition}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Select a panorama from the list</p>
            </div>
          )}
        </div>

        {/* Panorama List */}
        <div className="w-64 border-l bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Panoramas</h2>
            <div className="space-y-4">
              {project.images.map((image) => (
                <div
                  key={image.id}
                  onClick={() => {
                    if (isAddingHotspot && !targetImage && image.id !== selectedImage?.id) {
                      setTargetImage(image);
                    } else if (!isAddingHotspot) {
                      setSelectedImage(image);
                    }
                  }}
                  className={`
                    relative rounded-lg overflow-hidden cursor-pointer
                    ${selectedImage?.id === image.id ? 'ring-2 ring-blue-500' : ''}
                    ${targetImage?.id === image.id ? 'ring-2 ring-green-500' : ''}
                    ${isAddingHotspot && !targetImage && selectedImage?.id !== image.id ? 'hover:ring-2 hover:ring-green-500' : ''}
                    ${!isAddingHotspot ? 'hover:ring-2 hover:ring-blue-500' : ''}
                  `}
                >
                  <img
                    src={image.url}
                    alt="Panorama thumbnail"
                    className="w-full h-32 object-cover"
                  />
                  {isAddingHotspot && !targetImage && selectedImage?.id === image.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Source</p>
                    </div>
                  )}
                  {isAddingHotspot && targetImage?.id === image.id && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Target</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-xl font-semibold mb-4">Upload Panorama</h2>
            <UploadArea onFileSelect={handleFileSelect} />
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectView;