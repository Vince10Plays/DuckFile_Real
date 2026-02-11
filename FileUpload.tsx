
import React, { useRef, useState } from 'react';
import { FileType, DuckFile } from '../types';

interface FileUploadProps {
  onUpload: (file: DuckFile) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (mime: string): FileType => {
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    if (mime.startsWith('image/')) return 'image';
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('text/')) return 'text';
    if (mime.includes('presentation') || mime.includes('powerpoint')) return 'presentation';
    return 'unknown';
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const duckFile: DuckFile = {
          id: Math.random().toString(36).substr(2, 9),
          ownerId: '', // Will be set by App component based on active user
          name: file.name,
          type: getFileType(file.type),
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          uploadedAt: Date.now(),
          data: file
        };
        onUpload(duckFile);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div 
      className={`relative mt-6 mb-8 p-10 border-4 border-dashed rounded-3xl transition-all duration-300 text-center ${
        isDragging 
          ? 'border-green-500 bg-green-50 scale-[1.02]' 
          : 'border-yellow-300 bg-white hover:border-yellow-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <input 
        type="file" 
        multiple 
        className="hidden" 
        ref={fileInputRef} 
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600 animate-bounce">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Quack to Upload!</h2>
        <p className="text-gray-500 mb-4">Drag and drop your files here, or click to browse</p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 shadow-md transition-all active:scale-95"
        >
          Browse Pond
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
