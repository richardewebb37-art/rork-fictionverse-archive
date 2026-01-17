import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, BookOpen, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import CreateEntryModal from '@/components/CreateEntryModal';
import { useAuth } from '@/contexts/AuthContext';
import { getEntriesByAuthor, createEntry, Entry } from '@/services/firestore/entries.service';
import { getUniverseEntries, Universe, getAllUniverses } from '@/services/firestore/universes.service';

export default function NexusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'original' | 'inspired'>('all');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserEntries();
      fetchUniverses();
    }
  }, [isAuthenticated, user]);

  const fetchUserEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userEntries = await getEntriesByAuthor(user.uid);
      setEntries(userEntries);
    } catch (err: any) {
      setError(err.message || 'Failed to load your entries');
      console.error('Error fetching user entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUniverses = async () => {
    try {
      const universeData = await getAllUniverses();
      setUniverses(universeData);
    } catch (err: any) {
      console.error('Error fetching universes:', err);
    }
  };

  const getUniverseName = (universeId: string) => {
    const universe = universes.find(u => u.id === universeId);
    return universe?.name || 'Unknown Universe';
  };

  const handleEntryPress = (id: string) => {
    router.push({
      pathname: '/modal',
      params: { id }
    });
  };

  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    // Refresh the entries list
    await fetchUserEntries();
  };

  const filteredEntries = entries.filter(entry => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'original') return entry.type === 'original';
    if (activeFilter === 'inspired') return entry.type === 'inspired';
    return true;
  });

  const renderEntry = ({ item }: { item: Entry }) => (
    <TouchableOpacity 
      style={styles.entryCard}
      onPress={() => handleEntryPress(item.id)}
    >
      <Image source={{ uri: item.coverImage || '' }} style={styles.entryImage} />
      <View style={styles.entryOverlay} />
      <View style={styles.entryContent}>
        <View style={[
          styles.universeBadge,
          item.type === 'original' ? styles.badgeOriginal : styles.badgeInspired
        ]}>
          <Text style={styles.badgeText}>
            {item.type === 'original' ? 'ORIGINAL' : 'INSPIRED'}
          </Text>
        </View>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <Text style={styles.entryAuthor}>by {item.authorName}</Text>
        <Text style={styles.entryUniverse}>{getUniverseName(item.universe)}</Text>
        <Text style={styles.entryCount}>
          {item.createdAt.toDate().toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <GridBackground variant="archive" />
        <Header />
        <View style={styles.centerContainer}>
          <BookOpen size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>SIGN IN REQUIRED</Text>
          <Text style={styles.emptySubtext}>Sign in to create and manage your entries</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <GridBackground variant="archive" />
        <Header />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.cyan} />
          <Text style={styles.loadingText}>Loading your entries...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GridBackground variant="archive" />
      <Header />
      
      <View style={styles.mainContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>THE NEXUS ARCHIVE</Text>
          <Text style={styles.pageSubtitle}>Your creative universe</Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.filterActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>ALL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'original' && styles.filterActive]}
            onPress={() => setActiveFilter('original')}
          >
            <Text style={[styles.filterText, activeFilter === 'original' && styles.filterTextActive]}>ORIGINAL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'inspired' && styles.filterActive]}
            onPress={() => setActiveFilter('inspired')}
          >
            <Text style={[styles.filterText, activeFilter === 'inspired' && styles.filterTextActive]}>INSPIRED</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Archive List */}
        {filteredEntries.length === 0 ? (
          <View style={styles.centerContainer}>
            <TrendingUp size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>NO ENTRIES YET</Text>
            <Text style={styles.emptySubtext}>Create your first entry to get started</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEntries}
            renderItem={renderEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
          />
        )}

        {/* Create Button */}
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <CreateEntryModal 
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeepBlue,
  },
  mainContent: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 3,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  entryCard: {
    width: '48%',
    aspectRatio: 0.75,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
  },
  entryImage: {
    width: '100%',
    height: '50%',
  },
  entryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  entryContent: {
    flex: 1,
    padding: 10,
  },
  universeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  badgeOriginal: {
    backgroundColor: Colors.cyan,
  },
  badgeInspired: {
    backgroundColor: Colors.amber,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  entryAuthor: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  entryUniverse: {
    fontSize: 9,
    color: Colors.cyanLight,
    fontWeight: '600',
  },
  entryCount: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 4,
  },
  createButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cyanLight,
    shadowColor: Colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
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
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
  },
});