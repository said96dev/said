import React from 'react';
import { X } from 'lucide-react';
import ImageViewer from './ImageViewer';
import { ProjectImage } from '../types';

interface ImageCardProps {
  image: ProjectImage;
  onDelete: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete }) => {
  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 z-10 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
        aria-label="Delete image"
      >
        <X size={16} />
      </button>
       
      <ImageViewer image={image} /> 
    </div>
  );
};

export default ImageCard;