import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// Types
export interface Like {
  id: string;
  entryId: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

export interface Save {
  id: string;
  entryId: string;
  userId: string;
  savedAt: Timestamp;
}

export interface Comment {
  id: string;
  entryId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentId?: string; // For nested replies
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== LIKES ====================

const LIKES_COLLECTION = 'likes';

// Like an entry
export const likeEntry = async (
  entryId: string,
  userId: string,
  userName: string
): Promise<void> => {
  const likeRef = doc(firestore, LIKES_COLLECTION, `${entryId}_${userId}`);
  await setDoc(likeRef, {
    id: `${entryId}_${userId}`,
    entryId,
    userId,
    userName,
    createdAt: serverTimestamp(),
  });
};

// Unlike an entry
export const unlikeEntry = async (
  entryId: string,
  userId: string
): Promise<void> => {
  const likeRef = doc(firestore, LIKES_COLLECTION, `${entryId}_${userId}`);
  await deleteDoc(likeRef);
};

// Check if user liked entry
export const isEntryLiked = async (
  entryId: string,
  userId: string
): Promise<boolean> => {
  const docRef = doc(firestore, LIKES_COLLECTION, `${entryId}_${userId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

// Get likes for an entry
export const getEntryLikes = async (entryId: string): Promise<Like[]> => {
  const q = query(
    collection(firestore, LIKES_COLLECTION),
    where('entryId', '==', entryId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Like));
};

// Get entries liked by user
export const getUserLikedEntries = async (
  userId: string,
  limitCount: number = 50
): Promise<string[]> => {
  const q = query(
    collection(firestore, LIKES_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => (doc.data() as Like).entryId);
};

// Real-time like listener
export const subscribeToEntryLike = (
  entryId: string,
  userId: string,
  callback: (isLiked: boolean) => void
): (() => void) => {
  const likeRef = doc(firestore, LIKES_COLLECTION, `${entryId}_${userId}`);
  const unsubscribe = onSnapshot(likeRef, (doc) => {
    callback(doc.exists());
  });
  return unsubscribe;
};

// ==================== SAVES ====================

const SAVES_COLLECTION = 'saves';

// Save an entry
export const saveEntry = async (
  entryId: string,
  userId: string
): Promise<void> => {
  const saveRef = doc(firestore, SAVES_COLLECTION, `${entryId}_${userId}`);
  await setDoc(saveRef, {
    id: `${entryId}_${userId}`,
    entryId,
    userId,
    savedAt: serverTimestamp(),
  });
};

// Unsave an entry
export const unsaveEntry = async (
  entryId: string,
  userId: string
): Promise<void> => {
  const saveRef = doc(firestore, SAVES_COLLECTION, `${entryId}_${userId}`);
  await deleteDoc(saveRef);
};

// Check if entry is saved by user
export const isEntrySaved = async (
  entryId: string,
  userId: string
): Promise<boolean> => {
  const docRef = doc(firestore, SAVES_COLLECTION, `${entryId}_${userId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

// Get saved entries for user
export const getUserSavedEntries = async (
  userId: string,
  limitCount: number = 50
): Promise<Save[]> => {
  const q = query(
    collection(firestore, SAVES_COLLECTION),
    where('userId', '==', userId),
    orderBy('savedAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Save));
};

// Get user's saved entries with full entry data
export const getUserSavedEntriesWithDetails = async (
  userId: string,
  limitCount: number = 50
): Promise<any[]> => {
  const saves = await getUserSavedEntries(userId, limitCount);
  const entries: any[] = [];
  
  for (const save of saves) {
    const entry = await getDoc(doc(firestore, 'entries', save.entryId));
    if (entry.exists()) {
      entries.push({ id: entry.id, ...entry.data() });
    }
  }
  
  return entries;
};

// Real-time save listener
export const subscribeToEntrySave = (
  entryId: string,
  userId: string,
  callback: (isSaved: boolean) => void
): (() => void) => {
  const saveRef = doc(firestore, SAVES_COLLECTION, `${entryId}_${userId}`);
  const unsubscribe = onSnapshot(saveRef, (doc) => {
    callback(doc.exists());
  });
  return unsubscribe;
};

// ==================== COMMENTS ====================

const COMMENTS_COLLECTION = 'comments';

// Add comment
export const addComment = async (
  commentId: string,
  commentData: Partial<Comment>
): Promise<void> => {
  const commentRef = doc(firestore, COMMENTS_COLLECTION, commentId);
  await setDoc(commentRef, {
    id: commentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...commentData,
  });
};

// Update comment
export const updateComment = async (
  commentId: string,
  updates: Partial<Comment>
): Promise<void> => {
  const commentRef = doc(firestore, COMMENTS_COLLECTION, commentId);
  await updateDoc(commentRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete comment
export const deleteComment = async (commentId: string): Promise<void> => {
  const commentRef = doc(firestore, COMMENTS_COLLECTION, commentId);
  await deleteDoc(commentRef);
};

// Get comments for an entry
export const getEntryComments = async (entryId: string): Promise<Comment[]> => {
  const q = query(
    collection(firestore, COMMENTS_COLLECTION),
    where('entryId', '==', entryId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

// Get top-level comments (not replies)
export const getEntryTopLevelComments = async (entryId: string): Promise<Comment[]> => {
  const q = query(
    collection(firestore, COMMENTS_COLLECTION),
    where('entryId', '==', entryId),
    where('parentId', '==', null),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

// Get replies to a comment
export const getCommentReplies = async (parentId: string): Promise<Comment[]> => {
  const q = query(
    collection(firestore, COMMENTS_COLLECTION),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

// Get comments by user
export const getUserComments = async (
  userId: string,
  limitCount: number = 50
): Promise<Comment[]> => {
  const q = query(
    collection(firestore, COMMENTS_COLLECTION),
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
};

// Real-time comments listener
export const subscribeToEntryComments = (
  entryId: string,
  callback: (comments: Comment[]) => void
): (() => void) => {
  const q = query(
    collection(firestore, COMMENTS_COLLECTION),
    where('entryId', '==', entryId),
    orderBy('createdAt', 'desc')
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
    callback(comments);
  });
  return unsubscribe;
};