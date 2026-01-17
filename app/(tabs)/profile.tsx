import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Settings, Edit2, Award, BookOpen, Heart, Eye, ChevronRight, LogOut, X, 
  Bell, Shield, HelpCircle, Info, FileText, Lock, Mail, User as UserIcon
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getUserById, updateUser, User as FirestoreUser } from '@/services/firestore/users.service';
import { signOut } from '@/services/auth.service';
import { getEntriesByAuthor } from '@/services/firestore/entries.service';

type ModalType = 'editProfile' | 'settings' | 'achievements' | 'about' | 'privacy' | 'legal' | null;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [userData, setUserData] = useState<FirestoreUser | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    entries: 0,
    views: 0,
    likes: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserData();
    }
  }, [isAuthenticated, user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user data
      const userData = await getUserById(user.uid);
      setUserData(userData);
      setUsername(userData?.username || '');
      setBio(userData?.bio || '');

      // Fetch user's entries for stats
      const entries = await getEntriesByAuthor(user.uid);
      
      // Calculate stats
      const totalViews = entries.reduce((sum: number, entry: any) => sum + (entry.viewsCount || 0), 0);
      const totalLikes = entries.reduce((sum: number, entry: any) => sum + (entry.likesCount || 0), 0);
      
      setStats({
        entries: entries.length,
        views: totalViews,
        likes: totalLikes,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('Signed Out', 'You have been successfully signed out.');
              router.replace('/');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await updateUser(user.uid, {
        username: username,
        bio: bio,
      });
      Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
      setActiveModal(null);
      await fetchUserData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    }
  };

  const handleSettingPress = (setting: string) => {
    Alert.alert(setting, `${setting} settings will be available soon.`);
  };

  const renderEditProfileModal = () => (
    <Modal
      visible={activeModal === 'editProfile'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>EDIT PROFILE</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalLabel}>USERNAME</Text>
          <TextInput
            style={styles.modalInput}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={Colors.textMuted}
          />
          
          <Text style={styles.modalLabel}>BIO</Text>
          <TextInput
            style={[styles.modalInput, styles.modalTextArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={Colors.textMuted}
          />
          
          <TouchableOpacity style={styles.modalButton} onPress={handleSaveProfile}>
            <Text style={styles.modalButtonText}>SAVE CHANGES</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSettingsModal = () => (
    <Modal
      visible={activeModal === 'settings'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SETTINGS</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Notifications')}
          >
            <Bell size={20} color={Colors.cyan} />
            <Text style={styles.settingsItemText}>Notifications</Text>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Account')}
          >
            <UserIcon size={20} color={Colors.cyan} />
            <Text style={styles.settingsItemText}>Account</Text>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Email Preferences')}
          >
            <Mail size={20} color={Colors.cyan} />
            <Text style={styles.settingsItemText}>Email Preferences</Text>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => handleSettingPress('Help & Support')}
          >
            <HelpCircle size={20} color={Colors.cyan} />
            <Text style={styles.settingsItemText}>Help & Support</Text>
            <ChevronRight size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </Modal>
  );

  const achievements = [
    { id: '1', name: 'FIRST ENTRY', earned: stats.entries > 0, description: 'Published your first entry' },
    { id: '2', name: 'POPULAR', earned: stats.views >= 1000, description: 'Reached 1000 views' },
    { id: '3', name: 'TRENDSETTER', earned: false, description: 'Featured on trending' },
    { id: '4', name: 'VETERAN', earned: stats.entries >= 50, description: 'Published 50 entries' },
  ];

  const renderAchievementsModal = () => (
    <Modal
      visible={activeModal === 'achievements'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ACHIEVEMENTS</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          {achievements.map((achievement) => (
            <View 
              key={achievement.id} 
              style={[
                styles.achievementItem,
                !achievement.earned && styles.achievementItemLocked
              ]}
            >
              <Award 
                size={24} 
                color={achievement.earned ? Colors.amber : Colors.textMuted} 
              />
              <View style={styles.achievementInfo}>
                <Text style={[
                  styles.achievementItemName,
                  !achievement.earned && styles.achievementItemNameLocked
                ]}>
                  {achievement.name}
                </Text>
                <Text style={styles.achievementItemDesc}>
                  {achievement.description}
                </Text>
              </View>
              {achievement.earned && (
                <Text style={styles.achievementEarned}>✓</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  );

  const renderAboutModal = () => (
    <Modal
      visible={activeModal === 'about'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ABOUT</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.aboutContent}>
            <Text style={styles.aboutTitle}>THE FICTIONVERSE</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              The Fictionverse is the central hub for original and inspired constructivist fiction. 
              A place where creators can share their stories and connect with readers across the digital universe.
            </Text>
            <Text style={styles.aboutCopyright}>© 2026 The Fictionverse. All rights reserved.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPrivacyModal = () => (
    <Modal
      visible={activeModal === 'privacy'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>PRIVACY POLICY</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalScroll}>
            <Text style={styles.legalText}>
              <Text style={styles.legalHeading}>1. Information We Collect{'\n'}</Text>
              We collect information you provide directly to us, such as when you create an account, 
              publish content, or contact us for support.{'\n\n'}
              
              <Text style={styles.legalHeading}>2. How We Use Your Information{'\n'}</Text>
              We use the information we collect to provide, maintain, and improve our services, 
              and to communicate with you.{'\n\n'}
              
              <Text style={styles.legalHeading}>3. Data Security{'\n'}</Text>
              We implement appropriate security measures to protect your personal information 
              against unauthorized access, alteration, or destruction.{'\n\n'}
              
              <Text style={styles.legalHeading}>4. Contact Us{'\n'}</Text>
              If you have questions about this Privacy Policy, please contact us at privacy@fictionverse.app
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderLegalModal = () => (
    <Modal
      visible={activeModal === 'legal'}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveModal(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TERMS OF SERVICE</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalScroll}>
            <Text style={styles.legalText}>
              <Text style={styles.legalHeading}>1. Acceptance of Terms{'\n'}</Text>
              By accessing or using The Fictionverse, you agree to be bound by these Terms of Service.{'\n\n'}
              
              <Text style={styles.legalHeading}>2. User Content{'\n'}</Text>
              You retain ownership of content you create. By posting content, you grant us a license 
              to display and distribute your content on our platform.{'\n\n'}
              
              <Text style={styles.legalHeading}>3. Prohibited Conduct{'\n'}</Text>
              You agree not to post content that is illegal, harmful, threatening, abusive, 
              or otherwise objectionable.{'\n\n'}
              
              <Text style={styles.legalHeading}>4. Termination{'\n'}</Text>
              We reserve the right to terminate or suspend your account at our sole discretion.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const menuItems = [
    { label: 'Edit Profile', icon: Edit2, action: () => setActiveModal('editProfile') },
    { label: 'Settings', icon: Settings, action: () => setActiveModal('settings') },
    { label: 'Achievements', icon: Award, action: () => setActiveModal('achievements') },
  ];

  const infoItems = [
    { label: 'About', icon: Info, action: () => setActiveModal('about') },
    { label: 'Privacy Policy', icon: Shield, action: () => setActiveModal('privacy') },
    { label: 'Terms of Service', icon: FileText, action: () => setActiveModal('legal') },
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <GridBackground variant="archive" opacity={0.2} />
        <Header />
        <View style={styles.centerContainer}>
          <UserIcon size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>SIGN IN REQUIRED</Text>
          <Text style={styles.emptySubtext}>Sign in to view your profile</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <GridBackground variant="archive" opacity={0.2} />
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.cyan} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const statsData = [
    { label: 'ENTRIES', value: stats.entries.toString(), icon: BookOpen },
    { label: 'VIEWS', value: stats.views >= 1000 ? `${(stats.views / 1000).toFixed(1)}K` : stats.views.toString(), icon: Eye },
    { label: 'LIKES', value: stats.likes >= 1000 ? `${(stats.likes / 1000).toFixed(1)}K` : stats.likes.toString(), icon: Heart },
  ];

  const avatarUrl = userData?.avatar || user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop';

  return (
    <View style={styles.container}>
      <GridBackground variant="archive" opacity={0.2} />
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View style={styles.avatarBorder} />
          </View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.userHandle}>@{username.toLowerCase().replace(/ /g, '_')}</Text>
          <Text style={styles.bio}>{bio || 'No bio yet'}</Text>
        </View>

        <View style={styles.statsContainer}>
          {statsData.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <View key={stat.label} style={styles.statItem}>
                <IconComponent size={20} color={Colors.cyan} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.achievementsScroll}
        >
          {achievements.map((achievement) => (
            <TouchableOpacity 
              key={achievement.id} 
              style={[
                styles.achievementBadge,
                !achievement.earned && styles.achievementLocked,
              ]}
              onPress={() => setActiveModal('achievements')}
            >
              <Award 
                size={24} 
                color={achievement.earned ? Colors.amber : Colors.textMuted} 
              />
              <Text style={[
                styles.achievementName,
                !achievement.earned && styles.achievementNameLocked,
              ]}>
                {achievement.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity 
                key={item.label} 
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast
                ]}
                onPress={item.action}
              >
                <IconComponent size={20} color={Colors.cyan} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>INFORMATION</Text>
        <View style={styles.menuContainer}>
          {infoItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity 
                key={item.label} 
                style={[
                  styles.menuItem,
                  index === infoItems.length - 1 && styles.menuItemLast
                ]}
                onPress={item.action}
              >
                <IconComponent size={20} color={Colors.cyan} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={Colors.amber} />
          <Text style={styles.logoutText}>SIGN OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderEditProfileModal()}
      {renderSettingsModal()}
      {renderAchievementsModal()}
      {renderAboutModal()}
      {renderPrivacyModal()}
      {renderLegalModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeepBlue,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarBorder: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.cyan,
  },
  username: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
  },
  userHandle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  achievementsScroll: {
    gap: 12,
    paddingRight: 16,
    marginBottom: 24,
  },
  achievementBadge: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.amber,
    backgroundColor: 'rgba(255, 174, 0, 0.1)',
  },
  achievementLocked: {
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
  },
  achievementName: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.amber,
    letterSpacing: 0.5,
    marginTop: 8,
    textAlign: 'center',
  },
  achievementNameLocked: {
    color: Colors.textMuted,
  },
  menuContainer: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.amber,
    backgroundColor: 'rgba(255, 174, 0, 0.1)',
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.amber,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.bgDeepBlue,
    borderWidth: 2,
    borderColor: Colors.cyan,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: Colors.inputBg,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    padding: 14,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalTextArea: {
    height: 80,
    paddingTop: 14,
  },
  modalButton: {
    backgroundColor: Colors.cyan,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  settingsItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: 12,
  },
  achievementItemLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.amber,
    letterSpacing: 1,
  },
  achievementItemNameLocked: {
    color: Colors.textMuted,
  },
  achievementItemDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  achievementEarned: {
    fontSize: 18,
    color: Colors.cyan,
    fontWeight: '700',
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    marginBottom: 8,
  },
  aboutVersion: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 20,
  },
  aboutDescription: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  aboutCopyright: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  legalScroll: {
    maxHeight: 300,
  },
  legalText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 22,
  },
  legalHeading: {
    fontWeight: '700',
    color: Colors.cyan,
  },
});