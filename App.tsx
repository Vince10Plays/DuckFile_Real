
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FileCard from './components/FileCard';
import FileViewer from './components/FileViewer';
import Auth from './components/Auth';
import { DuckFile, User } from './types';
import { getAllFiles, saveFile, deleteFile, updateFile } from './services/storageService';
import { analyzeFile } from './services/geminiService';
import { DuckLogo } from './constants';
import { auth } from './services/firebaseService';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const App: React.FC = () => {
  const [allFiles, setAllFiles] = useState<DuckFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DuckFile | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Access is only granted if the user is logged in AND verified
      if (firebaseUser && firebaseUser.emailVerified) {
        setCurrentUser({
          id: firebaseUser.uid,
          name: firebaseUser.email?.split('@')[0] || 'Duck User',
          avatar: `https://picsum.photos/seed/${firebaseUser.uid}/40/40`
        });
      } else {
        setCurrentUser(null);
        setSelectedFile(null);
      }
      setInitializing(false);
    });

    loadFiles();
    return () => unsubscribe();
  }, []);

  const loadFiles = async () => {
    const data = await getAllFiles();
    setAllFiles(data.sort((a, b) => b.uploadedAt - a.uploadedAt));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleUpload = async (newFile: DuckFile) => {
    if (!currentUser) return;
    
    // Attach current user as the owner
    const ownedFile = { ...newFile, ownerId: currentUser.id };
    await saveFile(ownedFile);
    setAllFiles(prev => [ownedFile, ...prev]);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this file from the pond?')) {
      await deleteFile(id);
      setAllFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleAnalyze = async (file: DuckFile) => {
    setIsAnalyzing(true);
    const summary = await analyzeFile(file.data, file.name, file.mimeType);
    const updated = { ...file, summary };
    await updateFile(updated);
    setAllFiles(prev => prev.map(f => f.id === file.id ? updated : f));
    setIsAnalyzing(false);
  };

  // PRIVACY LAYER: Filter files so user only sees their own
  const userFiles = useMemo(() => {
    if (!currentUser) return [];
    return allFiles.filter(file => file.ownerId === currentUser.id);
  }, [allFiles, currentUser]);

  const filteredFiles = useMemo(() => {
    return userFiles.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || file.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [userFiles, searchQuery, filter]);

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50">
        <DuckLogo className="w-16 h-16 animate-bounce text-yellow-500 mb-4" />
        <p className="text-green-800 font-bold">Waddling to the pond...</p>
      </div>
    );
  }

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'video', label: 'Videos' },
    { id: 'audio', label: 'Music' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'text', label: 'Text' },
    { id: 'image', label: 'Images' },
    { id: 'presentation', label: 'Presentations' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <Header 
        isSignedIn={!!currentUser} 
        onToggleSignIn={(val) => !val && handleSignOut()} 
        userName={currentUser?.name}
        userAvatar={currentUser?.avatar}
      />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="max-w-xl text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                    {currentUser ? `Welcome back, ${currentUser.name}!` : 'Your Personal Storage Pond'}
                </h2>
                <p className="text-lg text-gray-600">
                    {currentUser 
                      ? "Your private files are safe and sound. Only you can see what's in your pond."
                      : "Store your important documents, favorite songs, and viral videos in one safe, private place."}
                </p>
            </div>
            <div className="bg-yellow-400 p-8 rounded-[3rem] shadow-xl rotate-3 flex items-center justify-center shrink-0">
                 <DuckLogo className="w-32 h-32" />
            </div>
        </div>

        {/* Conditionally render content */}
        {currentUser ? (
          <>
            <FileUpload onUpload={handleUpload} />

            {/* Toolbar */}
            <div className="sticky top-24 z-40 bg-yellow-50/80 backdrop-blur-md py-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex overflow-x-auto pb-2 md:pb-0 no-scrollbar space-x-2 w-full md:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilter(cat.id)}
                            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                                filter === cat.id 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'bg-white text-gray-600 hover:bg-yellow-100'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <input 
                        type="text" 
                        placeholder="Search your pond..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border-2 border-yellow-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors font-bold"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* File Grid */}
            {filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFiles.map(file => (
                        <FileCard 
                            key={file.id} 
                            file={file} 
                            onDelete={handleDelete}
                            onView={setSelectedFile}
                            onAnalyze={handleAnalyze}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-yellow-300">
                    <div className="inline-block p-6 bg-yellow-50 rounded-full mb-6">
                        <svg className="w-16 h-16 text-yellow-500 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-400">Empty Pond!</h3>
                    <p className="text-gray-400">Time to waddle some files in here.</p>
                </div>
            )}
          </>
        ) : (
          <Auth />
        )}
      </main>

      {/* Loading indicator for AI analysis */}
      {isAnalyzing && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 animate-pulse">
              <div className="w-4 h-4 bg-white rounded-full animate-bounce" />
              <span className="font-bold text-lg">Analyzing Pond...</span>
          </div>
      )}

      {selectedFile && (
        <FileViewer 
            file={selectedFile} 
            onClose={() => setSelectedFile(null)} 
        />
      )}

      {/* Footer */}
      <footer className="mt-20 py-10 text-center border-t-2 border-yellow-200">
          <div className="flex items-center justify-center space-x-2 mb-4">
              <DuckLogo className="w-8 h-8 opacity-50" />
              <span className="font-bold text-gray-400 uppercase tracking-widest text-sm">DuckFile &copy; 2024</span>
          </div>
          <p className="text-gray-400 text-xs">No ducks were harmed in the making of this storage cloud.</p>
      </footer>
    </div>
  );
};

export default App;
