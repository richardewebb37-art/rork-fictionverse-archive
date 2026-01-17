import { Audio, Video, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';

// Audio configuration for recording
export const AUDIO_RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// Supported media types
export const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/m4a', 'audio/webm'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const SUPPORTED_DOCUMENT_TYPES = ['application/pdf', 'text/plain', 'application/msword'];

// Maximum file sizes (in bytes)
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Request permissions
export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: audioStatus } = await Audio.requestPermissionsAsync();
    const { status: libraryStatus } = await MediaLibrary.requestPermissionsAsync();
    
    return (
      cameraStatus === 'granted' &&
      mediaStatus === 'granted' &&
      audioStatus === 'granted' &&
      libraryStatus === 'granted'
    );
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

// Pick an image from library
export async function pickImage(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
}

// Take a photo with camera
export async function takePhoto(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error taking photo:', error);
    return null;
  }
}

// Pick a video from library
export async function pickVideo(): Promise<string | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 300, // 5 minutes max
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error picking video:', error);
    return null;
  }
}

// Pick a document
export async function pickDocument(types?: string[]): Promise<DocumentPicker.DocumentPickerResult | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: types || ['*/*'],
      copyToCacheDirectory: true,
    });

    return result;
  } catch (error) {
    console.error('Error picking document:', error);
    return null;
  }
}

// Audio recording class
export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;

  async startRecording(): Promise<boolean> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(AUDIO_RECORDING_OPTIONS);
      this.recording = recording;
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) return null;

      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = this.recording.getURI();
      this.recording = null;
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  async playSound(uri: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      this.sound = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  async stopSound(): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  }
}

// Video player utilities
export async function loadVideo(uri: string): Promise<{ video: Video; status: AVPlaybackStatus } | null> {
  try {
    // This would be used with a Video component ref
    return null;
  } catch (error) {
    console.error('Error loading video:', error);
    return null;
  }
}

// File utilities
export async function getFileInfo(uri: string): Promise<FileSystem.FileInfo | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info;
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
}

export async function copyFile(sourceUri: string, destinationUri: string): Promise<boolean> {
  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
}

export async function deleteFile(uri: string): Promise<boolean> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Save to media library
export async function saveToMediaLibrary(uri: string): Promise<boolean> {
  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    return true;
  } catch (error) {
    console.error('Error saving to media library:', error);
    return false;
  }
}

// Share file
export async function shareFile(uri: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.log('Sharing is not available on this device');
      return false;
    }

    await Sharing.shareAsync(uri);
    return true;
  } catch (error) {
    console.error('Error sharing file:', error);
    return false;
  }
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format duration
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Validate file type
export function isValidFileType(mimeType: string, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const category = type.split('/')[0];
      return mimeType.startsWith(category + '/');
    }
    return mimeType === type;
  });
}

// Validate file size
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}