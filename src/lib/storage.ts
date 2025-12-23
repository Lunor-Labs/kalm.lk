/* eslint-disable @typescript-eslint/no-explicit-any */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadTherapistPhoto = async (file: File, therapistId?: string): Promise<UploadResult> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = therapistId 
      ? `${therapistId}-${timestamp}.${fileExtension}`
      : `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Create storage reference
    const storageRef = ref(storage, `therapist-photos/${fileName}`);
    
    // Upload file with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        therapistId: therapistId || 'unknown'
      }
    };

    // Log upload start only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Uploading file:', fileName);
    }
    const snapshot = await uploadBytes(storageRef, file, metadata);
    // Log success only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Upload successful');
    }

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    // Log URL only in development (sensitive information)
    if (process.env.NODE_ENV === 'development') {
      console.log('Download URL:', downloadURL);
    }
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath
    };
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Upload failed: You do not have permission to upload files. Please contact support.');
    } else if (error.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Upload failed due to an unexpected error. Please try again.');
    } else if (error.code === 'storage/invalid-format') {
      throw new Error('Invalid file format. Please upload a valid image file (JPG, PNG, etc.).');
    } else if (error.code === 'storage/invalid-argument') {
      throw new Error('Invalid file selected. Please choose a different image and try again.');
    } else {
      throw new Error('Failed to upload image. Please check your file and try again.');
    }
  }
};

export const deleteTherapistPhoto = async (photoPath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, photoPath);
    await deleteObject(storageRef);
    // Log success only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Photo deleted successfully:', photoPath);
    }
  } catch (error: any) {
    console.error('Delete error:', error);

    if (error.code === 'storage/object-not-found') {
      // File doesn't exist, which is fine - log only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('File not found, already deleted:', photoPath);
      }
    } else {
      throw new Error(error.message || 'Failed to delete image');
    }
  }
};

// Helper function to extract path from Firebase Storage URL
export const getStoragePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
  } catch {
    return null;
  }
};

// Helper function to validate image file
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size too large. Please upload an image smaller than 5MB.'
    };
  }

  return { isValid: true };
};