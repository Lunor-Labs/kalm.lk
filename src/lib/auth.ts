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
import { getNextId } from './counters';

// Enhanced login function that supports both email and username
export const signIn = async (credentials: LoginCredentials): Promise<User> => {
  let tempAuthUser: FirebaseUser | null = null; // Track temp anonymous auth for cleanup
  
  try {
    let firebaseUser: FirebaseUser;
    
    // Check if the input looks like an email (contains @)
    const isEmail = credentials.email.includes('@');
    
    if (isEmail) {
      // Regular email login (unchanged)
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      firebaseUser = userCredential.user;
    } else {
      // Username login - NEW: Sign in anonymously FIRST for authenticated query
      const tempCredential = await signInAnonymously(auth);
      tempAuthUser = tempCredential.user; // Temp auth for query
      
      // Now query users collection (authenticated, so rules allow list)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', credentials.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        await firebaseSignOut(auth); 
        throw new Error('Username not found. Please check your username or create an account.');
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const oldUid = userDoc.id; // UID from doc
      
      if (userData.isAnonymous) {
        firebaseUser = tempAuthUser; 
        tempAuthUser = null; 
        
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...userData,
          uid: firebaseUser.uid,
          updatedAt: serverTimestamp()
        }, { merge: true }); 
      } else {
        await firebaseSignOut(auth);
        tempAuthUser = null;
        
        if (!userData.email) {
          throw new Error('This account cannot be accessed with username login.');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, userData.email, credentials.password);
        firebaseUser = userCredential.user;
      }
    }
    
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }
    
    const userData = userDoc.data();
    
    // Backfill clientIdInt for existing users who don't have it yet
    if (userData.role === 'client' && !userData.clientIdInt) {
      try {
        const clientIdInt = await getNextId('client');
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          clientIdInt,
          updatedAt: serverTimestamp(),
        });
        // Log backfill operation only in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Backfilled clientIdInt (${clientIdInt}) for user ${firebaseUser.uid}`);
        }
      } catch (error) {
        // Log backfill failure only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to backfill clientIdInt for existing user:', error);
        }
        // Don't block login if backfill fails
      }
    }

    // Backfill therapistIdInt for existing therapists who don't have it yet
    if (userData.role === 'therapist' && !userData.therapistIdInt) {
      try {
        const therapistIdInt = await getNextId('therapist');
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          therapistIdInt,
          updatedAt: serverTimestamp(),
        });
        // Log backfill operation only in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Backfilled therapistIdInt (${therapistIdInt}) for user ${firebaseUser.uid}`);
        }
      } catch (error) {
        // Log backfill failure only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to backfill therapistIdInt for existing therapist:', error);
        }
        // Don't block login if backfill fails
      }
    }
    
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
    if (tempAuthUser) {
      await firebaseSignOut(auth);
    }
    
    console.error('Sign in error:', error);
    
    // Provide more specific error messages (unchanged)
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email or username. Please check your input or sign up.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password. Please check your credentials and try again.');
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
    
    // Generate sequential client ID for new user
    const clientIdInt = await getNextId('client');
    
    // Create user document in Firestore with default client role
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: signupData.displayName,
      role: 'client' as UserRole, // Default role for all signups
      phone: signupData.phone || null,
      isAnonymous: false,
      clientIdInt, // Sequential integer ID for easy tracking
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
      // Generate sequential client ID for new user
      const clientIdInt = await getNextId('client');
      
      // Create new user document with default client role
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        role: 'client' as UserRole,
        isAnonymous: false,
        clientIdInt, // Sequential integer ID for easy tracking
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
    // First, sign in anonymously with Firebase
    const userCredential = await signInAnonymously(auth);
    const firebaseUser = userCredential.user;
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', anonymousData.username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await firebaseSignOut(auth);
      throw new Error('Username already exists. Please choose a different username.');
    }    
    // Generate sequential client ID for new anonymous user
    const clientIdInt = await getNextId('client');
    
    // Create user document in Firestore for anonymous user
    const userData = {
      uid: firebaseUser.uid,
      email: null,
      displayName: anonymousData.username,
      username: anonymousData.username,
      role: 'client' as UserRole,
      isAnonymous: true,
      clientIdInt, // Sequential integer ID for easy tracking
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Log success only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('User document created successfully');
    }
    
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
    console.error('❌ Anonymous sign up error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Anonymous authentication is not enabled. Please contact support.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many requests. Please wait a moment and try again.');
    } else if (error.code === 'permission-denied' || error.message.includes('permission')) {
      throw new Error('Permission error. Please try again or contact support.');
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
    if (!firebaseUser) {
      // Log missing user only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('No Firebase user provided');
      }
      return null;}

    // Log user lookup only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Getting user document for:', firebaseUser.uid);
    }
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

    if (!userDoc.exists()) {
      // Log missing document only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('User document does not exist in Firestore');
      }
         // Return default user object when Firebase user exists but Firestore doc doesn't
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'User',
        role: 'client', // Default role
        isAnonymous: firebaseUser.isAnonymous || false,
        createdAt: new Date(), // Use current date as fallback
        updatedAt: new Date(),
      };
    }
    
    const userData = userDoc.data();
    // Log raw data only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Raw Firestore data:', userData);
    }

    // Backfill clientIdInt for existing users who don't have it yet
    if (userData.role === 'client' && !userData.clientIdInt) {
      try {
        const clientIdInt = await getNextId('client');
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          clientIdInt,
          updatedAt: serverTimestamp(),
        });
        // Log backfill operation only in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Backfilled clientIdInt (${clientIdInt}) for user ${firebaseUser.uid}`);
        }
      } catch (error) {
        // Log backfill failure only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to backfill clientIdInt for existing user:', error);
        }
        // Don't block user access if backfill fails
      }
    }

    // Backfill therapistIdInt for existing therapists who don't have it yet
    if (userData.role === 'therapist' && !userData.therapistIdInt) {
      try {
        const therapistIdInt = await getNextId('therapist');
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          therapistIdInt,
          updatedAt: serverTimestamp(),
        });
        // Log backfill operation only in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Backfilled therapistIdInt (${therapistIdInt}) for user ${firebaseUser.uid}`);
        }
      } catch (error) {
        // Log backfill failure only in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to backfill therapistIdInt for existing therapist:', error);
        }
        // Don't block user access if backfill fails
      }
    }
    
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
      
      // Generate sequential therapist ID for new therapist
      const therapistIdInt = await getNextId('therapist');
      
      // Create therapist document with placeholder values
      const therapistData = {
        id: uid,
        userId: uid,
        therapistIdInt, // Sequential integer ID for easy tracking
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