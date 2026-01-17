import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  stats: {
    entries: number;
    views: number;
    likes: number;
    followers: number;
    following: number;
  };
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    darkMode: boolean;
    autoSave: boolean;
  };
  role: 'user' | 'moderator' | 'admin';
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'users';

// Create user document
export const createUser = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  const userWithDefaults: User = {
    id: userId,
    username: userData.username || '',
    email: userData.email || '',
    avatar: userData.avatar,
    bio: userData.bio,
    stats: {
      entries: 0,
      views: 0,
      likes: 0,
      followers: 0,
      following: 0,
    },
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: true,
      autoSave: true,
    },
    role: 'user',
    isActive: true,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    ...userData,
  };
  await setDoc(userRef, userWithDefaults);
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const docRef = doc(firestore, COLLECTION_NAME, userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<User | null> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('username', '==', username.toLowerCase())
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }
  return null;
};

// Update user
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<void> => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Update user preferences
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<User['preferences']>
): Promise<void> => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  await updateDoc(userRef, {
    'preferences': preferences,
    updatedAt: serverTimestamp(),
  });
};

// Increment stats
export const incrementUserStats = async (
  userId: string,
  stat: keyof User['stats'],
  amount: number = 1
): Promise<void> => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  await updateDoc(userRef, {
    [`stats.${stat}`]: increment(amount),
    updatedAt: serverTimestamp(),
  });
};

// Follow user
export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  const currentUserRef = doc(firestore, COLLECTION_NAME, currentUserId);
  const targetUserRef = doc(firestore, COLLECTION_NAME, targetUserId);
  
  await Promise.all([
    updateDoc(currentUserRef, {
      following: increment(1),
      updatedAt: serverTimestamp(),
    }),
    updateDoc(targetUserRef, {
      followers: increment(1),
      updatedAt: serverTimestamp(),
    }),
  ]);
};

// Unfollow user
export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  const currentUserRef = doc(firestore, COLLECTION_NAME, currentUserId);
  const targetUserRef = doc(firestore, COLLECTION_NAME, targetUserId);
  
  await Promise.all([
    updateDoc(currentUserRef, {
      following: increment(-1),
      updatedAt: serverTimestamp(),
    }),
    updateDoc(targetUserRef, {
      followers: increment(-1),
      updatedAt: serverTimestamp(),
    }),
  ]);
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  await deleteDoc(userRef);
};

// Search users
export const searchUsers = async (
  searchTerm: string,
  limitCount: number = 20
): Promise<User[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    orderBy('username'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as User))
    .filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Get trending users
export const getTrendingUsers = async (limitCount: number = 10): Promise<User[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('stats.followers', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

// Real-time user listener
export const subscribeToUser = (
  userId: string,
  callback: (user: User | null) => void
): (() => void) => {
  const userRef = doc(firestore, COLLECTION_NAME, userId);
  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as User);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};