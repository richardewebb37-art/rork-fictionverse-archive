# Fictionverse Archive

A React Native/Expo mobile application for sharing and discovering original and inspired fiction content. Built with a cyberpunk/sci-fi aesthetic.

## 🚀 Features

### Core Features
- **Home Feed**: Browse fiction entries with search and filter capabilities
- **Explore**: Discover universes by category, trending content, and curated collections
- **Library**: Save entries, track reading history, and manage favorites
- **Profile**: User profile management, achievements, and settings
- **Nexus Archive**: Create and submit original or inspired fiction entries

### Entry Creation (4-Step Process)
1. **Work Type Selection**: Choose between Original Work or Inspired By
2. **Universe Selection**: Select from existing universes or create new ones
3. **Entry Details**: Add title, author, source, and upload content
4. **Agreement**: Review and accept submission guidelines

### Authentication
- Sign In / Sign Up modal accessible from header logo
- Email/password authentication
- Password visibility toggle
- Forgot password functionality

## 📦 Installed Packages

### Core Dependencies
- `expo` ~54.0.27 - Expo SDK
- `react` 19.1.0 - React framework
- `react-native` 0.81.5 - React Native framework
- `expo-router` ~6.0.17 - File-based routing

### UI & Styling
- `lucide-react-native` - Icon library
- `expo-linear-gradient` - Gradient backgrounds
- `expo-blur` - Blur effects
- `react-native-svg` - SVG support
- `react-native-reanimated` - Animations

### Media & Files
- `expo-av` - Audio/Video playback and recording
- `expo-video` - Video player component
- `expo-image` - Optimized image component
- `expo-image-picker` - Camera and photo library access
- `expo-document-picker` - Document selection
- `expo-file-system` - File system operations
- `expo-media-library` - Media library access
- `expo-sharing` - Share content

### 3D & Graphics
- `three` - Three.js 3D library
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - Useful helpers for R3F

### Storage & Security
- `@react-native-async-storage/async-storage` - Async storage
- `expo-secure-store` - Secure storage for sensitive data
- `expo-clipboard` - Clipboard access

### Notifications & Updates
- `expo-notifications` - Push notifications
- `expo-updates` - OTA updates

### State Management
- `zustand` - State management
- `@tanstack/react-query` - Data fetching and caching

### Navigation & Gestures
- `expo-router` - File-based routing
- `react-native-gesture-handler` - Gesture handling
- `react-native-screens` - Native navigation
- `react-native-safe-area-context` - Safe area handling

### Backend (Firebase)
- `firebase` - Firebase SDK (Web)
- `@react-native-firebase/app` - Firebase App (Native)
- `@react-native-firebase/auth` - Firebase Authentication
- `@react-native-firebase/firestore` - Cloud Firestore Database
- `@react-native-firebase/storage` - Firebase Cloud Storage
- `@react-native-firebase/messaging` - Cloud Messaging (FCM)
- `@react-native-firebase/analytics` - Firebase Analytics
- `@react-native-firebase/crashlytics` - Crash Reporting
- `@react-native-firebase/remote-config` - Remote Configuration

## 🔥 Firebase Integration

This app uses Firebase for backend services including:
- **Authentication** - Email/password, Google, Apple sign-in
- **Firestore Database** - Users, entries, comments, likes, saves
- **Cloud Storage** - Images, audio, video files
- **Cloud Messaging** - Push notifications
- **Analytics** - User tracking and insights

### Setup Instructions

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable services: Authentication, Firestore, Storage
3. Add your app (Android/iOS/Web) in Firebase Console
4. Copy configuration to `.env` file (see `.env.example`)
5. Follow detailed setup in [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

### Firestore Collections

- `users` - User profiles and preferences
- `entries` - Fiction entries with content
- `likes` - Entry likes
- `saves` - Saved entries
- `comments` - Entry comments
- `notifications` - User notifications
- `universes` - Fiction universes

## 📁 Project Structure

```
rork-fictionverse-archive/
├── app/                          # App screens (file-based routing)
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab layout configuration
│   │   ├── index.tsx             # Home screen
│   │   ├── explore.tsx           # Explore screen
│   │   ├── create.tsx            # Nexus Archive screen
│   │   ├── library.tsx           # Library screen
│   │   └── profile.tsx           # Profile screen
│   ├── _layout.tsx               # Root layout
│   ├── modal.tsx                 # Entry detail modal
│   ├── +not-found.tsx            # 404 screen
│   └── +native-intent.tsx        # Deep linking
├── components/                   # Reusable components
│   ├── CreateEntryModal.tsx      # 4-step entry creation
│   ├── FictionCard.tsx           # Entry card component
│   ├── FilterBar.tsx             # Filter buttons
│   ├── GridBackground.tsx        # Animated grid background
│   ├── Header.tsx                # App header with auth modal
│   ├── HeroPanel.tsx             # Hero section
│   ├── HexagonButton.tsx         # Hexagon-shaped button
│   ├── NexusIcon.tsx             # Custom Nexus tab icon
│   └── SearchBar.tsx             # Search input
├── constants/                    # App constants
│   └── colors.ts                 # Color palette
├── mocks/                        # Mock data
│   └── fictionEntries.ts         # Sample entries
├── utils/                        # Utility functions
│   ├── index.ts                  # Exports
│   ├── mediaUtils.ts             # Media handling utilities
│   ├── notificationUtils.ts      # Notification utilities
│   └── storageUtils.ts           # Storage utilities
├── assets/                       # Static assets
│   └── images/                   # Image assets
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Design System

### Color Palette
- **Background**: `#0a1929` (Deep Blue)
- **Primary**: `#00d4ff` (Cyan)
- **Secondary**: `#ffae00` (Amber)
- **Text**: `#ffffff` (White), `#8892a0` (Muted)
- **Cards**: `rgba(0, 212, 255, 0.08)` with cyan borders

### Typography
- Headers: Bold, uppercase, letter-spacing
- Body: Clean, readable
- Labels: Small, muted, uppercase

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm
- Expo CLI
- Firebase account (free tier works)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd rork-fictionverse-archive

# Install dependencies
bun install

# Setup Firebase (see FIREBASE_SETUP.md)
cp .env.example .env
# Edit .env with your Firebase credentials

# Start development server
bun run start-web
```

### Scripts
- `bun run start` - Start Expo with tunnel
- `bun run start-web` - Start web development server
- `bun run lint` - Run ESLint

## 📱 Building for Production

### Android
```bash
# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS
```bash
# Build for App Store
eas build --platform ios --profile production
```

### Web
```bash
# Export for web
npx expo export --platform web
```

## 🔧 Configuration

### App Configuration (app.json)
- Bundle ID: `com.fictionverse.archive`
- Scheme: `fictionverse`
- Dark theme enabled
- Permissions configured for camera, microphone, storage

### Permissions
- **Camera**: For capturing images
- **Photo Library**: For selecting images
- **Microphone**: For audio recordings
- **Storage**: For file operations
- **Notifications**: For push notifications

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Please read the contribution guidelines before submitting pull requests.

---

Built with ❤️ using Expo and React Native