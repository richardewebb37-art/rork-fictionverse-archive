# Firebase Setup Guide

This guide will help you set up Firebase for the Fictionverse Archive app.

## 📋 Prerequisites

1. A Google account
2. A Firebase project (free tier is fine)

---

## 🔧 Step-by-Step Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., `fictionverse-archive`)
4. Accept the terms and click **"Continue"**
5. Enable Google Analytics (optional but recommended)
6. Click **"Create project"**

### 2. Register App with Firebase

#### For Mobile Apps:

1. In Firebase Console, click the **⚙️** (gear) icon → **Project Settings**
2. Scroll to "Your apps" section
3. Click **Add app** → **Android** or **iOS**

#### Android Setup:

1. Package name: `com.fictionverse.archive` (from `app.json`)
2. Download `google-services.json`
3. Place it in the root of your project (same level as `package.json`)
4. Add SHA-1 fingerprints (for debug and release builds)

```bash
# Get debug SHA-1
cd android && ./gradlew signingReport

# For production, you'll need your release keystore SHA-1
```

#### iOS Setup:

1. Bundle ID: `com.fictionverse.archive` (from `app.json`)
2. Download `GoogleService-Info.plist`
3. Place it in the root of your project

#### Web Setup:

1. Click **Add app** → **Web**
2. App nickname: `Fictionverse Web`
3. Copy the config object (you'll need this for `.env` file)

### 3. Enable Firebase Services

#### Authentication:

1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Enable **Email/Password** sign-in method
4. (Optional) Enable **Google**, **Apple**, etc.
5. Set up email templates for verification and password reset

#### Firestore Database:

1. Go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose a location (nearest to your users)
4. Select **Start in Test Mode** (for development)
5. Later, switch to Production mode and set up rules

#### Storage:

1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose a location (same as Firestore)
4. Set up security rules

#### Cloud Functions:

1. Go to **Build** → **Functions**
2. Click **"Get started"**
3. Upgrade your project to Blaze plan (required for Cloud Functions)

#### Cloud Messaging (FCM):

1. Go to **Build** → **Cloud Messaging**
2. Click **"Get started"**
3. Get your server key and sender ID

#### Hosting:

1. Go to **Build** → **Hosting**
2. Click **"Get started"**
3. Follow the instructions to deploy your website

---

## 🔐 Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isModerator() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'moderator'];
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Entries collection
    match /entries/{entryId} {
      allow read: if true; // Public read for approved entries
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.authorId) || isModerator();
      allow delete: if isOwner(resource.data.authorId) || isAdmin();
    }
    
    // Likes collection
    match /likes/{likeId} {
      allow read: if true;
      allow create, delete: if isAuthenticated();
    }
    
    // Saves collection
    match /saves/{saveId} {
      allow read: if true;
      allow create, delete: if isAuthenticated();
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.authorId) || isModerator();
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isOwner(resource.data.userId);
    }
    
    // Universes collection
    match /universes/{universeId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.createdBy) || isModerator();
      allow delete: if isAdmin();
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }
    
    match /entries/{entryId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
    
    match /universes/{universeId}/{allPaths=**} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}
```

---

## 📝 Environment Variables

Create a `.env` file in your project root:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

You can find these values in:
- Firebase Console → Project Settings → General → Your Apps

---

## 🚀 Cloud Functions (Optional but Recommended)

Install Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

Example Cloud Function for entry approval:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Auto-approve entries (disabled by default)
exports.autoApproveEntry = functions.firestore
  .document('entries/{entryId}')
  .onCreate(async (snap, context) => {
    const entry = snap.data();
    
    // Auto-approve original entries
    if (entry.type === 'original') {
      await snap.ref.update({ status: 'approved' });
      
      // Send notification to author
      await admin.firestore().collection('notifications').add({
        userId: entry.authorId,
        type: 'entry_approved',
        title: 'Entry Approved!',
        body: `Your entry "${entry.title}" has been approved.`,
        data: { entryId: context.params.entryId },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  });

// Send notification on new like
exports.onNewLike = functions.firestore
  .document('likes/{likeId}')
  .onCreate(async (snap, context) => {
    const like = snap.data();
    
    // Get entry details
    const entryDoc = await admin.firestore().collection('entries').doc(like.entryId).get();
    const entry = entryDoc.data();
    
    // Don't notify if author liked their own entry
    if (entry.authorId === like.userId) return;
    
    // Send notification
    await admin.firestore().collection('notifications').add({
      userId: entry.authorId,
      type: 'new_like',
      title: 'New Like!',
      body: `${like.userName} liked your entry "${entry.title}"`,
      data: { entryId: like.entryId },
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

---

## 📊 Analytics Setup

Enable Firebase Analytics:

1. Go to **Build** → **Analytics**
2. Ensure it's enabled
3. Review default events
4. Set up custom events if needed

---

## 🔍 Testing

### Test Authentication:

```typescript
import { signUp, signIn, signOut } from '@/services/auth.service';

// Sign up
const user = await signUp('test@example.com', 'password123', 'TestUser');

// Sign in
const user = await signIn('test@example.com', 'password123');

// Sign out
await signOut();
```

### Test Firestore:

```typescript
import { createEntry, getEntriesByAuthor } from '@/services/firestore';

// Create entry
await createEntry('entry-id', {
  title: 'Test Entry',
  authorId: 'user-id',
  authorName: 'TestUser',
  type: 'original',
  universe: 'Test Universe',
  description: 'Test description',
  content: 'Test content',
});

// Get entries
const entries = await getEntriesByAuthor('user-id');
```

### Test Storage:

```typescript
import { uploadImage } from '@/services/storage.service';

// Upload image
const result = await uploadImage('entries', 'test.jpg', imageBlob);
console.log('URL:', result.url);
```

---

## 🎯 Next Steps

1. ✅ Complete Firebase project setup
2. ✅ Add environment variables
3. ✅ Set up security rules
4. ⏳ Integrate Firebase services in the app
5. ⏳ Set up Cloud Functions (optional)
6. ⏳ Test authentication flow
7. ⏳ Test data persistence
8. ⏳ Deploy to production

---

## 📚 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firebase Pricing](https://firebase.google.com/pricing)

---

## ❓ Troubleshooting

### Common Issues:

1. **"Firebase is not properly configured"**
   - Make sure you've added all environment variables
   - Restart the app after adding `.env` file

2. **"Permission denied"**
   - Check Firestore/Storage security rules
   - Ensure user is authenticated

3. **"Network error"**
   - Check your internet connection
   - Verify Firebase project settings

4. **"App not registered"**
   - Ensure `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) is in the correct location
   - Double-check bundle/package ID matches

---

For support, check the [Firebase Community](https://firebase.google.com/support-community) or [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase).