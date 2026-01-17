import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import HeroPanel from '@/components/HeroPanel';
import SearchBar from '@/components/SearchBar';
import FilterBar, { FilterType } from '@/components/FilterBar';
import FictionCard from '@/components/FictionCard';
import { getEntries, Entry } from '@/services/entries.service';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch entries from Firestore
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEntries = await getEntries({ limit: 50 });
      setEntries(fetchedEntries);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = useMemo(() => {
    let filtered = entries;
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter(e => e.status === activeFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.authorName.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [searchQuery, activeFilter, entries]);

  const handleCardPress = (id: string) => {
    router.push({
      pathname: '/modal',
      params: { id }
    });
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <Header onProfilePress={handleProfilePress} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <HeroPanel />
        
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <FilterBar 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.cyan} />
            <Text style={styles.loadingText}>Loading entries...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO ENTRIES FOUND</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredEntries.map(entry => (
            <FictionCard
              key={entry.id}
              entry={{
                id: entry.id,
                title: entry.title,
                description: entry.description,
                author: entry.authorName,
                image: entry.coverImage || '',
                status: entry.status || 'approved',
                likes: entry.likesCount || 0,
                views: entry.viewsCount || 0,
              }}
              onPress={() => handleCardPress(entry.id)}
            />
          ))
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});