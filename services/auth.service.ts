import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUser as createFirestoreUser, getUserById } from './firestore/users.service';

// Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  code: string;
  message: string;
}

// Get current user
export const getCurrentUser = (): User | null => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  return {
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    photoURL: currentUser.photoURL,
    emailVerified: currentUser.emailVerified,
  };
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  username: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName: username });

    // Create user document in Firestore
    await createFirestoreUser(firebaseUser.uid, {
      username,
      email,
      displayName: username,
    });

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  } catch (error: any) {
    const authError: AuthError = {
      code: error.code,
      message: getAuthErrorMessage(error.code),
    };
    throw authError;
  }
};

// Sign in with email and password
export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  } catch (error: any) {
    const authError: AuthError = {
      code: error.code,
      message: getAuthErrorMessage(error.code),
    };
    throw authError;
  }
};

// Sign in with Google
export const signInWithGoogle = async (
  idToken: string
): Promise<User> => {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // Check if user document exists, create if not
    const existingUser = await getUserById(firebaseUser.uid);
    if (!existingUser) {
      await createFirestoreUser(firebaseUser.uid, {
        username: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL,
      });
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  } catch (error: any) {
    const authError: AuthError = {
      code: error.code,
      message: getAuthErrorMessage(error.code),
    };
    throw authError;
  }
};

// Sign in with Apple
export const signInWithApple = async (
  idToken: string,
  nonce: string
): Promise<User> => {
  try {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken, rawNonce: nonce });
    const userCredential = await signInWithCredential(auth, credential);
    const firebaseUser = userCredential.user;

    // Check if user document exists, create if not
    const existingUser = await getUserById(firebaseUser.uid);
    if (!existingUser) {
      await createFirestoreUser(firebaseUser.uid, {
        username: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL,
      });
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    };
  } catch (error: any) {
    const authError: AuthError = {
      code: error.code,
      message: getAuthErrorMessage(error.code),
    };
    throw authError;
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    const authError: AuthError = {
      code: error.code,
      message: getAuthErrorMessage(error.code),
    };
    throw authError;
  }
};

// Update user profile
export const updateUserProfile = async (
  updates: {
    displayName?: string;
    photoURL?: string;
  }
): Promise<void> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw { code: 'no-user', message: 'No user is signed in' };
  }

  await updateProfile(currentUser, updates);
};

// Auth state listener
export const onAuthStateChange = (
  callback: (user: User | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      });
    } else {
      callback(null);
    }
  });
};

// Error message helper
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'Account not found. Please sign up.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email already in use.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'Account already exists with different credentials.',
    'auth/invalid-credential': 'Invalid credentials.',
    'auth/operation-not-allowed': 'Operation not allowed.',
    'auth/requires-recent-login': 'Please sign in again to perform this action.',
  };

  return errorMessages[code] || 'An error occurred. Please try again.';
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};