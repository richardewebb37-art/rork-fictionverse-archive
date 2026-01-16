import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import HeroPanel from '@/components/HeroPanel';
import SearchBar from '@/components/SearchBar';
import FilterBar, { FilterType } from '@/components/FilterBar';
import FictionCard from '@/components/FictionCard';
import { fictionEntries } from '@/mocks/fictionEntries';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredEntries = useMemo(() => {
    let entries = fictionEntries;
    
    if (activeFilter !== 'all') {
      entries = entries.filter(e => e.status === activeFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      entries = entries.filter(e => 
        e.title.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.author.toLowerCase().includes(query)
      );
    }
    
    return entries;
  }, [searchQuery, activeFilter]);

  const handleCardPress = (id: string) => {
    console.log('Card pressed:', id);
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      <Header />
      
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
        
        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>NO ENTRIES FOUND</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredEntries.map(entry => (
            <FictionCard
              key={entry.id}
              entry={entry}
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
