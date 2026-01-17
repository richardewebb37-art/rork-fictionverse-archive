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
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';

// Types
export type NotificationType =
  | 'entry_approved'
  | 'entry_rejected'
  | 'new_like'
  | 'new_comment'
  | 'new_follower'
  | 'entry_shared'
  | 'mention'
  | 'system'
  | 'reminder';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}

const COLLECTION_NAME = 'notifications';

// Create notification
export const createNotification = async (
  notificationData: Partial<Notification>
): Promise<void> => {
  const notificationRef = doc(collection(firestore, COLLECTION_NAME));
  const notificationWithDefaults: Notification = {
    id: notificationRef.id,
    read: false,
    createdAt: serverTimestamp() as Timestamp,
    ...notificationData,
  } as Notification;
  
  await setDoc(notificationRef, notificationWithDefaults);
};

// Get notification by ID
export const getNotificationById = async (
  notificationId: string
): Promise<Notification | null> => {
  const docRef = doc(firestore, COLLECTION_NAME, notificationId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Notification;
  }
  return null;
};

// Get notifications for user
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (
  userId: string
): Promise<number> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.size;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  const notificationRef = doc(firestore, COLLECTION_NAME, notificationId);
  await updateDoc(notificationRef, { read: true });
};

// Mark all notifications as read for user
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<void> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false),
    limit(100) // Batch limit
  );
  const querySnapshot = await getDocs(q);
  
  const batch = querySnapshot.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(batch);
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(firestore, COLLECTION_NAME, notificationId);
  await deleteDoc(notificationRef);
};

// Clear all notifications for user
export const clearAllNotifications = async (userId: string): Promise<void> => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    limit(500) // Batch limit
  );
  const querySnapshot = await getDocs(q);
  
  const batch = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(batch);
};

// Real-time notifications listener
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Notification));
    callback(notifications);
  });
  return unsubscribe;
};

// Real-time unread count listener
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
): (() => void) => {
  const q = query(
    collection(firestore, COLLECTION_NAME),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
  return unsubscribe;
};

// Pre-built notification templates
export const NotificationTemplates = {
  entryApproved: (userId: string, entryId: string, entryTitle: string) => ({
    userId,
    type: 'entry_approved' as const,
    title: '✅ Entry Approved!',
    body: `Your entry "${entryTitle}" has been approved and is now live.`,
    data: { action: 'view_entry', entryId },
  }),

  entryRejected: (
    userId: string,
    entryId: string,
    entryTitle: string,
    reason?: string
  ) => ({
    userId,
    type: 'entry_rejected' as const,
    title: '❌ Entry Needs Revision',
    body: reason
      ? `Your entry "${entryTitle}" needs revision: ${reason}`
      : `Your entry "${entryTitle}" needs some changes before it can be published.`,
    data: { action: 'edit_entry', entryId },
  }),

  newLike: (userId: string, entryId: string, entryTitle: string, likerName: string) => ({
    userId,
    type: 'new_like' as const,
    title: '❤️ New Like!',
    body: `${likerName} liked your entry "${entryTitle}".`,
    data: { action: 'view_entry', entryId },
  }),

  newComment: (
    userId: string,
    entryId: string,
    entryTitle: string,
    commenterName: string
  ) => ({
    userId,
    type: 'new_comment' as const,
    title: '💬 New Comment!',
    body: `${commenterName} commented on "${entryTitle}".`,
    data: { action: 'view_comments', entryId },
  }),

  newFollower: (userId: string, followerId: string, followerName: string) => ({
    userId,
    type: 'new_follower' as const,
    title: '👤 New Follower!',
    body: `${followerName} started following you.`,
    data: { action: 'view_profile', followerId },
  }),

  systemUpdate: (userId: string, message: string) => ({
    userId,
    type: 'system' as const,
    title: '📢 Fictionverse Update',
    body: message,
    data: { action: 'view_updates' },
  }),

  writingReminder: (userId: string) => ({
    userId,
    type: 'reminder' as const,
    title: '✍️ Time to Write!',
    body: 'Your creative universe awaits. Continue your story today!',
    data: { action: 'create_entry' },
  }),
};

// Helper function to create notification from template
export const createNotificationFromTemplate = async (
  template: Partial<Notification>
): Promise<void> => {
  await createNotification(template);
};