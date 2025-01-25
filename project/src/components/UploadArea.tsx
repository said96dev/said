import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelect }) => {
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File) => {
    setError(null);
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      {error ? (
        <div className="text-red-500">
          <AlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your 360° image here, or click to select a file
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports: JPG, PNG (max 10MB)
          </p>
        </>
      )}
    </div>
  );
};

export default UploadArea;