import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  listAll,
} from 'firebase/storage';
import { storage } from '../config/firebase';

// Types
export type StorageFolder = 'users' | 'entries' | 'universes' | 'media' | 'temp';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

// Helper to generate unique filename
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
};

// Upload file to Firebase Storage
export const uploadFile = async (
  folder: StorageFolder,
  fileName: string,
  file: Blob | Uint8Array,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> },
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  const uniqueFileName = generateFileName(fileName);
  const storageRef = ref(storage, `${folder}/${uniqueFileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          const progress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          };
          onProgress(progress);
        }
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const metaData = await getMetadata(uploadTask.snapshot.ref);
          
          resolve({
            url: downloadURL,
            path: uploadTask.snapshot.ref.fullPath,
            name: uniqueFileName,
            size: metaData.size,
            contentType: metaData.contentType || 'application/octet-stream',
          });
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

// Upload image
export const uploadImage = async (
  folder: StorageFolder,
  fileName: string,
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadFile(
    folder,
    fileName,
    imageBlob,
    { contentType: 'image/jpeg' },
    onProgress
  );
};

// Upload video
export const uploadVideo = async (
  folder: StorageFolder,
  fileName: string,
  videoBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadFile(
    folder,
    fileName,
    videoBlob,
    { contentType: 'video/mp4' },
    onProgress
  );
};

// Upload audio
export const uploadAudio = async (
  folder: StorageFolder,
  fileName: string,
  audioBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadFile(
    folder,
    fileName,
    audioBlob,
    { contentType: 'audio/mpeg' },
    onProgress
  );
};

// Upload document
export const uploadDocument = async (
  folder: StorageFolder,
  fileName: string,
  documentBlob: Blob,
  contentType: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadFile(
    folder,
    fileName,
    documentBlob,
    { contentType },
    onProgress
  );
};

// Delete file from storage
export const deleteFile = async (path: string): Promise<void> => {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
};

// Get file download URL
export const getFileURL = async (path: string): Promise<string> => {
  const fileRef = ref(storage, path);
  return getDownloadURL(fileRef);
};

// Get file metadata
export const getFileMetadata = async (path: string) => {
  const fileRef = ref(storage, path);
  return getMetadata(fileRef);
};

// List all files in a folder
export const listFiles = async (folder: StorageFolder) => {
  const folderRef = ref(storage, folder);
  const result = await listAll(folderRef);
  
  return {
    items: result.items.map((item) => ({
      name: item.name,
      path: item.fullPath,
    })),
    prefixes: result.prefixes.map((prefix) => ({
      name: prefix.name,
      path: prefix.fullPath,
    })),
  };
};

// Delete all files in a folder
export const deleteFolder = async (folder: StorageFolder): Promise<void> => {
  try {
    const { items } = await listFiles(folder);
    
    await Promise.all(
      items.map((item) => deleteFile(item.path))
    );
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};

// Helper to upload user avatar
export const uploadUserAvatar = async (
  userId: string,
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadImage('users', `${userId}_avatar.jpg`, imageBlob, onProgress);
};

// Helper to upload entry cover image
export const uploadEntryCover = async (
  entryId: string,
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadImage('entries', `${entryId}_cover.jpg`, imageBlob, onProgress);
};

// Helper to upload entry media (images/audio/video)
export const uploadEntryMedia = async (
  entryId: string,
  mediaType: 'image' | 'audio' | 'video',
  fileName: string,
  mediaBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  switch (mediaType) {
    case 'image':
      return uploadImage('entries', `${entryId}_${fileName}`, mediaBlob, onProgress);
    case 'audio':
      return uploadAudio('entries', `${entryId}_${fileName}`, mediaBlob, onProgress);
    case 'video':
      return uploadVideo('entries', `${entryId}_${fileName}`, mediaBlob, onProgress);
    default:
      throw new Error(`Unsupported media type: ${mediaType}`);
  }
};

// Helper to upload universe cover
export const uploadUniverseCover = async (
  universeId: string,
  imageBlob: Blob,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadImage('universes', `${universeId}_cover.jpg`, imageBlob, onProgress);
};

// Upload multiple files
export const uploadMultipleFiles = async (
  uploads: Array<{
    folder: StorageFolder;
    fileName: string;
    file: Blob;
    metadata?: { contentType?: string };
  }>,
  onProgress?: (index: number, progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results = await Promise.all(
    uploads.map((upload, index) =>
      uploadFile(
        upload.folder,
        upload.fileName,
        upload.file,
        upload.metadata,
        (progress) => onProgress?.(index, progress)
      )
    )
  );
  
  return results;
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};