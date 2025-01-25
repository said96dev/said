import React from 'react';
import { ProjectImage } from '../types';

interface ImageSelectorProps {
  images: ProjectImage[];
  onSelect: (imageId: string) => void;
  onClose: () => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({ images, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Select Target Image</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => onSelect(image.id)}
              className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
            >
              <img
                src={image.url}
                alt="360° view"
                className="w-full h-48 object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelector;