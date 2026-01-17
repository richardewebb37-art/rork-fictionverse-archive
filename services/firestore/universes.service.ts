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
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// Types
export type UniverseType = 'original' | 'inspired';

export interface Universe {
  id: string;
  name: string;
  type: UniverseType;
  createdBy: string;
  creatorName: string;
  description?: string;
  coverImage?: string;
  tags: string[];
  entryCount: number;
  followerCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COLLECTION_NAME = 'universes';

// Create universe
export const createUniverse = async (
  universeData: Partial<Universe>
): Promise<void> => {
  const universeRef = doc(collection(firestore, COLLECTION_NAME));
  const universeWithDefaults: Universe = {
    id: universeRef.id,
    type: universeData.type || 'original',
    entryCount: 0,
    followerCount: 0,
    isFeatured: false,
    isActive: true,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    ...universeData,
  } as Universe;
  
  await setDoc(universeRef, universeWithDefaults);
};

// Get universe by ID
export const getUniverseById = async (
  universeId: string
): Promise<Universe | null> => {
  const docRef = doc(firestore, COLLECTION_NAME, universeId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Universe;
  }
  return null;
};

// Get universe by name
export const getUniverseByName = async (
  name: string
): Promise<Universe | null> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('name', '==', name)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Universe;
  }
  return null;
};

// Update universe
export const updateUniverse = async (
  universeId: string,
  updates: Partial<Universe>
): Promise<void> => {
  const universeRef = doc(firestore, COLLECTION_NAME, universeId);
  await updateDoc(universeRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// Delete universe
export const deleteUniverse = async (universeId: string): Promise<void> => {
  const universeRef = doc(firestore, COLLECTION_NAME, universeId);
  await deleteDoc(universeRef);
};

// Increment entry count
export const incrementUniverseEntryCount = async (
  universeId: string,
  amount: number = 1
): Promise<void> => {
  const universeRef = doc(firestore, COLLECTION_NAME, universeId);
  await updateDoc(universeRef, {
    entryCount: increment(amount),
    updatedAt: serverTimestamp(),
  });
};

// Increment follower count
export const incrementUniverseFollowerCount = async (
  universeId: string,
  amount: number = 1
): Promise<void> => {
  const universeRef = doc(firestore, COLLECTION_NAME, universeId);
  await updateDoc(universeRef, {
    followerCount: increment(amount),
    updatedAt: serverTimestamp(),
  });
};

// Get universes by type (original/inspired)
export const getUniversesByType = async (
  type: UniverseType,
  limitCount: number = 50
): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('type', '==', type),
    where('isActive', '==', true),
    orderBy('entryCount', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Universe));
};

// Get featured universes
export const getFeaturedUniverses = async (
  limitCount: number = 10
): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('isFeatured', '==', true),
    where('isActive', '==', true),
    orderBy('followerCount', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Universe));
};

// Get trending universes (by entry count)
export const getTrendingUniverses = async (
  limitCount: number = 20
): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('entryCount', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Universe));
};

// Search universes
export const searchUniverses = async (
  searchTerm: string,
  limitCount: number = 20
): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('name'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  const term = searchTerm.toLowerCase();
  return querySnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Universe))
    .filter(universe => 
      universe.name.toLowerCase().includes(term) ||
      universe.description?.toLowerCase().includes(term) ||
      universe.tags.some(tag => tag.toLowerCase().includes(term))
    );
};

// Get universes created by user
export const getUserUniverses = async (
  userId: string,
  limitCount: number = 20
): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('createdBy', '==', userId),
    where('isActive', '==', true),
    orderBy('entryCount', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Universe));
};

// Get all universes (for admin)
export const getAllUniverses = async (): Promise<Universe[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    orderBy('name')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Universe));
};

// Real-time universe listener
export const subscribeToUniverse = (
  universeId: string,
  callback: (universe: Universe | null) => void
): (() => void) => {
  const universeRef = doc(firestore, COLLECTION_NAME, universeId);
  const unsubscribe = onSnapshot(universeRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Universe);
    } else {
      callback(null);
    }
  });
  return unsubscribe;
};

// Real-time universes feed
export const subscribeToUniversesFeed = (
  callback: (universes: Universe[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('isActive', '==', true),
    orderBy('entryCount', 'desc'),
    limit(limitCount)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const universes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Universe));
    callback(universes);
  });
  return unsubscribe;
};

// Pre-defined inspired universes (constants)
export const PREDEFINED_INSPIRED_UNIVERSES = [
  'DC Universe',
  'Marvel Universe',
  'Star Trek Universe',
  'Star Wars Universe',
  'Transformers Universe',
  'GI Joe Universe',
  'Harry Potter Universe',
  'Lord of the Rings Universe',
  'Blade Runner Universe',
  'The Matrix Universe',
  'Alien Universe',
  'Terminator Universe',
  'Jurassic Park Universe',
  'Back to the Future Universe',
  'Ghostbusters Universe',
];

// Initialize predefined universes (run once during app setup)
export const initializePredefinedUniverses = async (): Promise<void> => {
  for (const universeName of PREDEFINED_INSPIRED_UNIVERSES) {
    const existing = await getUniverseByName(universeName);
    if (!existing) {
      await createUniverse({
        name: universeName,
        type: 'inspired',
        createdBy: 'system',
        creatorName: 'Fictionverse',
        description: `Stories inspired by ${universeName}`,
        tags: [universeName.toLowerCase().replace(' ', '-')],
      });
    }
  }
};