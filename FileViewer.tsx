
import React, { useEffect, useState } from 'react';
import { DuckFile } from '../types';

interface FileViewerProps {
  file: DuckFile;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
  const [url, setUrl] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file.data);
    setUrl(objectUrl);

    if (file.type === 'text') {
        const reader = new FileReader();
        reader.onload = (e) => setTextContent(e.target?.result as string || '');
        reader.readAsText(file.data);
    }

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const renderContent = () => {
    switch (file.type) {
      case 'image':
        return <img src={url} alt={file.name} className="max-w-full max-h-[70vh] rounded-lg shadow-lg mx-auto" />;
      case 'video':
        return <video src={url} controls className="w-full max-h-[70vh] rounded-lg shadow-lg" />;
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-green-50 rounded-xl">
             <svg className="w-20 h-20 text-green-600 mb-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <audio src={url} controls className="w-full max-w-md" />
          </div>
        );
      case 'pdf':
        return <iframe src={url} className="w-full h-[70vh] rounded-lg" title={file.name} />;
      case 'text':
        return (
            <div className="p-6 bg-gray-50 border rounded-lg max-h-[70vh] overflow-auto whitespace-pre-wrap font-mono text-sm">
                {textContent}
            </div>
        );
      default:
        return (
          <div className="text-center py-20">
            <p className="text-xl font-bold text-gray-700 mb-4">Waddle... We can't preview this file type yet!</p>
            <a 
              href={url} 
              download={file.name}
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl font-bold"
            >
              Download to Open
            </a>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 truncate">{file.name}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-auto">
          {renderContent()}
        </div>
        <div className="p-6 bg-yellow-50 border-t flex justify-end space-x-4">
            <button 
                onClick={onClose}
                className="px-6 py-2 text-gray-600 font-bold"
            >
                Close
            </button>
            <a 
              href={url} 
              download={file.name}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold shadow-sm hover:bg-green-700"
            >
              Download
            </a>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
