import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Storage, STORAGE_KEYS } from './storageUtils';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Notification types
export type NotificationType = 
  | 'new_entry'
  | 'entry_approved'
  | 'entry_rejected'
  | 'new_follower'
  | 'new_like'
  | 'new_comment'
  | 'system'
  | 'reminder';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  newEntries: boolean;
  likes: boolean;
  comments: boolean;
  followers: boolean;
  systemUpdates: boolean;
  reminders: boolean;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  newEntries: true,
  likes: true,
  comments: true,
  followers: true,
  systemUpdates: true,
  reminders: true,
};

// Request permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00d4ff',
      });

      await Notifications.setNotificationChannelAsync('entries', {
        name: 'Entry Updates',
        description: 'Notifications about your entries',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#00d4ff',
      });

      await Notifications.setNotificationChannelAsync('social', {
        name: 'Social',
        description: 'Likes, comments, and followers',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#00d4ff',
      });

      await Notifications.setNotificationChannelAsync('system', {
        name: 'System',
        description: 'System updates and announcements',
        importance: Notifications.AndroidImportance.LOW,
        lightColor: '#00d4ff',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Get push token for remote notifications
export async function getPushToken(): Promise<string | null> {
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'fictionverse-archive',
    });
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

// Schedule a local notification
export async function scheduleNotification(
  notification: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> {
  try {
    const settings = await getNotificationSettings();
    
    // Check if notifications are enabled
    if (!settings.enabled) {
      return null;
    }

    // Check specific notification type settings
    if (!shouldSendNotification(notification.type, settings)) {
      return null;
    }

    const channelId = getChannelForType(notification.type);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: true,
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: trigger || null, // null means immediate
    });

    return id;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

// Send immediate notification
export async function sendImmediateNotification(notification: NotificationData): Promise<string | null> {
  return scheduleNotification(notification, null);
}

// Schedule a reminder
export async function scheduleReminder(
  title: string,
  body: string,
  date: Date,
  data?: Record<string, any>
): Promise<string | null> {
  // Calculate seconds from now
  const seconds = Math.max(1, Math.floor((date.getTime() - Date.now()) / 1000));
  
  return scheduleNotification(
    {
      type: 'reminder',
      title,
      body,
      data,
    },
    { type: 'timeInterval', seconds, repeats: false } as Notifications.TimeIntervalTriggerInput
  );
}

// Cancel a scheduled notification
export async function cancelNotification(id: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Dismiss all notifications
export async function dismissAllNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error dismissing notifications:', error);
  }
}

// Set badge count
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

// Get badge count
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

// Notification settings management
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await Storage.get<NotificationSettings>(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  return settings || DEFAULT_NOTIFICATION_SETTINGS;
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<boolean> {
  return Storage.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
}

export async function updateNotificationSetting(
  key: keyof NotificationSettings,
  value: boolean
): Promise<boolean> {
  const settings = await getNotificationSettings();
  settings[key] = value;
  return saveNotificationSettings(settings);
}

// Helper functions
function shouldSendNotification(type: NotificationType, settings: NotificationSettings): boolean {
  switch (type) {
    case 'new_entry':
    case 'entry_approved':
    case 'entry_rejected':
      return settings.newEntries;
    case 'new_like':
      return settings.likes;
    case 'new_comment':
      return settings.comments;
    case 'new_follower':
      return settings.followers;
    case 'system':
      return settings.systemUpdates;
    case 'reminder':
      return settings.reminders;
    default:
      return true;
  }
}

function getChannelForType(type: NotificationType): string {
  switch (type) {
    case 'new_entry':
    case 'entry_approved':
    case 'entry_rejected':
      return 'entries';
    case 'new_like':
    case 'new_comment':
    case 'new_follower':
      return 'social';
    case 'system':
      return 'system';
    default:
      return 'default';
  }
}

// Notification listeners
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Pre-built notification templates
export const NotificationTemplates = {
  entryApproved: (entryTitle: string): NotificationData => ({
    type: 'entry_approved',
    title: '✅ Entry Approved!',
    body: `Your entry "${entryTitle}" has been approved and is now live.`,
    data: { action: 'view_entry' },
  }),

  entryRejected: (entryTitle: string, reason?: string): NotificationData => ({
    type: 'entry_rejected',
    title: '❌ Entry Needs Revision',
    body: reason 
      ? `Your entry "${entryTitle}" needs revision: ${reason}`
      : `Your entry "${entryTitle}" needs some changes before it can be published.`,
    data: { action: 'edit_entry' },
  }),

  newFollower: (followerName: string): NotificationData => ({
    type: 'new_follower',
    title: '👤 New Follower!',
    body: `${followerName} started following you.`,
    data: { action: 'view_profile' },
  }),

  newLike: (entryTitle: string, likerName: string): NotificationData => ({
    type: 'new_like',
    title: '❤️ New Like!',
    body: `${likerName} liked your entry "${entryTitle}".`,
    data: { action: 'view_entry' },
  }),

  newComment: (entryTitle: string, commenterName: string): NotificationData => ({
    type: 'new_comment',
    title: '💬 New Comment!',
    body: `${commenterName} commented on "${entryTitle}".`,
    data: { action: 'view_comments' },
  }),

  systemUpdate: (message: string): NotificationData => ({
    type: 'system',
    title: '📢 Fictionverse Update',
    body: message,
    data: { action: 'view_updates' },
  }),

  writingReminder: (): NotificationData => ({
    type: 'reminder',
    title: '✍️ Time to Write!',
    body: 'Your creative universe awaits. Continue your story today!',
    data: { action: 'create_entry' },
  }),
};