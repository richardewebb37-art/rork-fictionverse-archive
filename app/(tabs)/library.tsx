import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookMarked, Clock, Heart, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getUserSavedEntries, unsaveEntry, getUserSavedEntriesWithDetails } from '@/services/firestore/interactions.service';
import { Entry } from '@/services/firestore/entries.service';

type LibraryTab = 'saved' | 'history' | 'favorites';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('saved');
  const [savedEntries, setSavedEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: { key: LibraryTab; label: string; icon: typeof BookMarked }[] = [
    { key: 'saved', label: 'SAVED', icon: BookMarked },
    { key: 'history', label: 'HISTORY', icon: Clock },
    { key: 'favorites', label: 'FAVORITES', icon: Heart },
  ];

  useEffect(() => {
    if (isAuthenticated && user && activeTab === 'saved') {
      fetchSavedEntries();
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchSavedEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const entries = await getUserSavedEntriesWithDetails(user.uid);
      setSavedEntries(entries);
    } catch (err: any) {
      setError(err.message || 'Failed to load saved entries');
      console.error('Error fetching saved entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (id: string, title: string) => {
    router.push({
      pathname: '/modal',
      params: { id, title }
    });
  };

  const handleDeleteItem = async (entryId: string, title: string) => {
    if (!user) return;
    
    Alert.alert(
      'Remove Entry',
      `Are you sure you want to remove "${title}" from your saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await unsaveEntry(entryId, user.uid);
              // Refresh the list
              setSavedEntries(prev => prev.filter(e => e.id !== entryId));
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove entry');
            }
          }
        },
      ]
    );
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <GridBackground variant="archive" />
        <Header onProfilePress={handleProfilePress} />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyState}>
            <BookMarked size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>SIGN IN REQUIRED</Text>
            <Text style={styles.emptySubtext}>Sign in to access your library</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GridBackground variant="archive" />
      <Header onProfilePress={handleProfilePress} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MY LIBRARY</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <IconComponent 
                  size={18} 
                  color={activeTab === tab.key ? '#000' : Colors.cyan} 
                />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'saved' && (
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.cyan} />
                <Text style={styles.loadingText}>Loading saved entries...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : savedEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <BookMarked size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>NO SAVED ENTRIES</Text>
                <Text style={styles.emptySubtext}>Save entries to read later</Text>
              </View>
            ) : (
              savedEntries.map((entry) => (
                <TouchableOpacity 
                  key={entry.id} 
                  style={styles.listItem}
                  onPress={() => handleItemPress(entry.id, entry.title)}
                >
                  <Image source={{ uri: entry.coverImage || '' }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{entry.title}</Text>
                    <Text style={styles.itemAuthor}>by {entry.authorName}</Text>
                    <Text style={styles.itemMeta}>
                      {entry.createdAt.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(entry.id, entry.title)}
                  >
                    <Trash2 size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.emptyState}>
            <Clock size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>READING HISTORY</Text>
            <Text style={styles.emptySubtext}>Coming soon</Text>
          </View>
        )}

        {activeTab === 'favorites' && (
          <View style={styles.emptyState}>
            <Heart size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>NO FAVORITES YET</Text>
            <Text style={styles.emptySubtext}>Entries you love will appear here</Text>
          </View>
        )}
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
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: Colors.cyan,
    marginTop: 8,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: Colors.cyan,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: '#000',
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 0.5,
  },
  itemAuthor: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    borderStyle: 'dashed',
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
});