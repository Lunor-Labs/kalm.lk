/* eslint-disable @typescript-eslint/no-explicit-any */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole, LoginCredentials, SignupData, AnonymousSignupData } from '../types/auth';

// Enhanced login function that supports both email and username
export const signIn = async (credentials: LoginCredentials): Promise<User> => {
  try {
    let firebaseUser: FirebaseUser;
    
    // Check if the input looks like an email (contains @)
    const isEmail = credentials.email.includes('@');
    
    if (isEmail) {
      // Regular email login
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      firebaseUser = userCredential.user;
    } else {
      // Username login - find the user by username first
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', credentials.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Username not found. Please check your username or create an account.');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      // For anonymous users, we need to handle authentication differently
      if (userData.isAnonymous) {
        // For anonymous users, sign in anonymously and link to existing user data
        const userCredential = await signInAnonymously(auth);
        firebaseUser = userCredential.user;
        
        // Update the existing user document with the new anonymous session UID
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          uid: firebaseUser.uid,
          updatedAt: serverTimestamp()
        });
      } else {
        // For regular users with usernames, we need their email
        if (!userData.email) {
          throw new Error('This account cannot be accessed with username login.');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, credentials.password);
        firebaseUser = userCredential.user;
      }
    }
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || userData.displayName,
      role: userData.role as UserRole,
      isAnonymous: userData.isAnonymous || false,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email or username. Please check your input or sign up.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled. Please contact support.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please wait a moment and try again.');
    } else {
      throw new Error(error.message || 'Failed to sign in');
    }
  }
};

export const signUp = async (signupData: SignupData): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
    const firebaseUser = userCredential.user;
    
    // Update display name
    await updateProfile(firebaseUser, {
      displayName: signupData.displayName
    });
    
    // Create user document in Firestore with default client role
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: signupData.displayName,
      role: 'client' as UserRole, // Default role for all signups
      phone: signupData.phone || null,
      isAnonymous: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      role: 'client',
      isAnonymous: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists. Please sign in instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format. Please enter a valid email address.');
    } else {
      throw new Error(error.message || 'Failed to create account');
    }
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const firebaseUser = userCredential.user;
    
    // Check if user already exists
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      // Create new user document with default client role
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'client' as UserRole,
        isAnonymous: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'client',
        isAnonymous: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Return existing user
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: userData.role as UserRole,
        isAnonymous: false,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    }
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signUpAnonymous = async (anonymousData: AnonymousSignupData): Promise<User> => {
  try {
    // Check if username already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', anonymousData.username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Username already exists. Please choose a different username.');
    }
    
    // First, sign in anonymously with Firebase
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;
    
    // Create user document in Firestore for anonymous user
    const userData = {
      uid: firebaseUser.uid,
      email: null,
      displayName: anonymousData.username,
      username: anonymousData.username,
      role: 'client' as UserRole,
      isAnonymous: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    return {
      uid: firebaseUser.uid,
      email: null,
      displayName: anonymousData.username,
      role: 'client',
      isAnonymous: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error: any) {
    console.error('Anonymous sign up error:', error);
    
    // Provide more specific error messages
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Anonymous authentication is not enabled. Please contact support.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else {
      throw new Error(error.message || 'Failed to create anonymous account');
    }
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    if (!firebaseUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || userData.displayName,
      role: userData.role as UserRole,
      isAnonymous: userData.isAnonymous || false,
      createdAt: userData.createdAt?.toDate() || new Date(),
      updatedAt: userData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Admin function to update user role
export const updateUserRole = async (uid: string, newRole: UserRole): Promise<void> => {
  try {
    // Check if user document exists first
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User document not found. Cannot update role.');
    }
    
    // Update the user role
    await updateDoc(userDocRef, {
      role: newRole,
      updatedAt: serverTimestamp(),
    });

    // If promoting to therapist, create therapist profile
    if (newRole === 'therapist') {
      const userData = userDoc.data();
      
      // Create therapist document with placeholder values
      const therapistData = {
        id: uid,
        userId: uid,
        firstName: userData.displayName?.split(' ')[0] || 'First',
        lastName: userData.displayName?.split(' ')[1] || 'Last',
        email: userData.email,
        credentials: ['Licensed Therapist'],
        specializations: ['General Counseling'],
        languages: ['English'],
        services: ['Individual Therapy'],
        isAvailable: false,
        sessionFormats: ['video'],
        bio: 'Professional therapist ready to help you on your wellness journey.',
        experience: 1,
        rating: 5.0,
        reviewCount: 0,
        hourlyRate: 4500,
        profilePhoto: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=400',
        nextAvailableSlot: 'Please set availability',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
        
      await setDoc(doc(db, 'therapists', uid), therapistData);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user role');
  }
};