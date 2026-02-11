
import React, { useState } from 'react';
import { DuckFile } from '../types';
import { FileIcons } from '../constants';

interface FileCardProps {
  file: DuckFile;
  onDelete: (id: string) => void;
  onView: (file: DuckFile) => void;
  onAnalyze: (file: DuckFile) => void;
}

const FileCard: React.FC<FileCardProps> = ({ file, onDelete, onView, onAnalyze }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div 
      className="relative bg-white rounded-2xl p-4 border-2 border-transparent hover:border-green-500 transition-all duration-300 shadow-sm hover:shadow-xl group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-yellow-50 rounded-xl">
          {FileIcons[file.type] || FileIcons.unknown}
        </div>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAnalyze(file)}
            className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-700"
            title="AI Analyze"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(file.id)}
            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="cursor-pointer" onClick={() => onView(file)}>
        <h3 className="font-bold text-gray-800 truncate mb-1" title={file.name}>
          {file.name}
        </h3>
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <span>{formatSize(file.size)}</span>
          <span>•</span>
          <span>{formatDate(file.uploadedAt)}</span>
        </div>
      </div>

      {file.summary && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg text-xs text-green-800 line-clamp-2 italic">
          "{file.summary}"
        </div>
      )}
    </div>
  );
};

export default FileCard;
