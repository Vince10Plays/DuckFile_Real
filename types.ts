
export type FileType = 'video' | 'audio' | 'pdf' | 'text' | 'presentation' | 'image' | 'unknown';

export interface DuckFile {
  id: string;
  ownerId: string; // Tracks which user uploaded the file
  name: string;
  type: FileType;
  mimeType: string;
  size: number;
  uploadedAt: number;
  data: Blob;
  summary?: string;
}

export interface StorageState {
  files: DuckFile[];
  loading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}
