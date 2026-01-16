import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Edit2, Award, BookOpen, Heart, Eye, ChevronRight, LogOut } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';

const AVATAR_URL = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop';

const stats = [
  { label: 'ENTRIES', value: '12', icon: BookOpen },
  { label: 'VIEWS', value: '24.5K', icon: Eye },
  { label: 'LIKES', value: '3.2K', icon: Heart },
];

const achievements = [
  { id: '1', name: 'FIRST ENTRY', earned: true },
  { id: '2', name: 'POPULAR', earned: true },
  { id: '3', name: 'TRENDSETTER', earned: false },
  { id: '4', name: 'VETERAN', earned: false },
];

const menuItems = [
  { label: 'Edit Profile', icon: Edit2 },
  { label: 'Settings', icon: Settings },
  { label: 'Achievements', icon: Award },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

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
            <Image source={{ uri: AVATAR_URL }} style={styles.avatar} />
            <View style={styles.avatarBorder} />
          </View>
          <Text style={styles.username}>NEXUS_PRIME</Text>
          <Text style={styles.userHandle}>@nexus_prime_7</Text>
          <Text style={styles.bio}>Exploring the boundaries of digital consciousness</Text>
        </View>

        <View style={styles.statsContainer}>
          {stats.map((stat) => {
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
            <View 
              key={achievement.id} 
              style={[
                styles.achievementBadge,
                !achievement.earned && styles.achievementLocked,
              ]}
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
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>SETTINGS</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity key={item.label} style={styles.menuItem}>
                <IconComponent size={20} color={Colors.cyan} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <LogOut size={18} color={Colors.amber} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.amber,
    letterSpacing: 1,
  },
});
