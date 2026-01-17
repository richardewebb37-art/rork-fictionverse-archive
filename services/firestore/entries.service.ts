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
  startAfter,
  increment,
  serverTimestamp,
  arrayUnion,
  onSnapshot,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// Types
export type EntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type EntryType = 'original' | 'inspired';

export interface Entry {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  type: EntryType;
  universe: string;
  universeType: EntryType;
  description: string;
  content: string;
  coverImage?: string;
  mediaFiles?: {
    type: 'image' | 'audio' | 'video';
    url: string;
    name: string;
    size: number;
  }[];
  tags: string[];
  status: EntryStatus;
  inspiredBy?: string;
  source?: string;
  stats: {
    views: number;
    likes: number;
    saves: number;
    comments: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginatedEntries {
  entries: Entry[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

const COLLECTION_NAME = 'entries';

// Create entry
export const createEntry = async (
  entryId: string,
  entryData: Partial<Entry>
): Promise<void> => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  const entryWithDefaults: Entry = {
    id: entryId,
    title: entryData.title || '',
    authorId: entryData.authorId || '',
    authorName: entryData.authorName || '',
    type: entryData.type || 'original',
    universe: entryData.universe || '',
    universeType: entryData.universeType || entryData.type || 'original',
    description: entryData.description || '',
    content: entryData.content || '',
    coverImage: entryData.coverImage,
    mediaFiles: entryData.mediaFiles || [],
    tags: entryData.tags || [],
    status: 'pending',
    inspiredBy: entryData.inspiredBy,
    source: entryData.source,
    stats: {
      views: 0,
      likes: 0,
      saves: 0,
      comments: 0,
    },
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    ...entryData,
  };
  await setDoc(entryRef, entryWithDefaults);
};

// Get entry by ID
export const getEntryById = async (entryId: string): Promise<Entry | null> => {
  const docRef = doc(firestore, COLLECTION_NAME, entryId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Entry;
  }
  return null;
};

// Update entry
export const updateEntry = async (
  entryId: string,
  updates: Partial<Entry>
): Promise<void> => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  await updateDoc(entryRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete entry
export const deleteEntry = async (entryId: string): Promise<void> => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  await deleteDoc(entryRef);
};

// Update entry status (for approval workflow)
export const updateEntryStatus = async (
  entryId: string,
  status: EntryStatus
): Promise<void> => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  await updateDoc(entryRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

// Increment entry stats
export const incrementEntryStats = async (
  entryId: string,
  stat: keyof Entry['stats'],
  amount: number = 1
): Promise<void> => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  await updateDoc(entryRef, {
    [`stats.${stat}`]: increment(amount),
    updatedAt: serverTimestamp(),
  });
};

// Get entries by author
export const getEntriesByAuthor = async (
  authorId: string,
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('authorId', '==', authorId),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Get entries by universe
export const getEntriesByUniverse = async (
  universe: string,
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('universe', '==', universe),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Get entries by type (original/inspired)
export const getEntriesByType = async (
  type: EntryType,
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('type', '==', type),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Get trending entries
export const getTrendingEntries = async (
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('stats.views', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Get recent entries
export const getRecentEntries = async (
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Search entries
export const searchEntries = async (
  searchTerm: string,
  limitCount: number = 20
): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('title'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  const term = searchTerm.toLowerCase();
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Entry))
    .filter(entry => 
      entry.title.toLowerCase().includes(term) ||
      entry.description.toLowerCase().includes(term) ||
      entry.authorName.toLowerCase().includes(term) ||
      entry.tags.some(tag => tag.toLowerCase().includes(term))
    );
};

// Paginated entries with infinite scroll
export const getPaginatedEntries = async (
  lastDoc: QueryDocumentSnapshot | null = null,
  limitCount: number = 20
): Promise<PaginatedEntries> => {
  let q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const querySnapshot = await getDocs(q);
  const entries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
  
  return {
    entries,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
    hasMore: querySnapshot.docs.length === limitCount,
  };
};

// Get drafts for a user
export const getUserDrafts = async (userId: string): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('authorId', '==', userId),
    where('status', '==', 'draft'),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Get pending entries (for moderation)
export const getPendingEntries = async (): Promise<Entry[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
};

// Real-time entry listener
export const subscribeToEntry = (
  entryId: string,
  callback: (entry: Entry | null) => void
): (() => void) => {
  const entryRef = doc(firestore, COLLECTION_NAME, entryId);
  const unsubscribe = onSnapshot(entryRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Entry);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

// Real-time entries feed
export const subscribeToEntriesFeed = (
  callback: (entries: Entry[]) => void,
  limitCount: number = 20
): (() => void) => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Entry));
    callback(entries);
  });
  return unsubscribe;
};