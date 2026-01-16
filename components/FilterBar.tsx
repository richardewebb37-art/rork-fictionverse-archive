import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

export type FilterType = 'all' | 'original' | 'inspired';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'original', label: 'ORIGINAL' },
  { key: 'inspired', label: 'INSPIRED' },
];

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            activeFilter === filter.key && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(filter.key)}
          testID={`filter-${filter.key}`}
        >
          <Text style={[
            styles.filterText,
            activeFilter === filter.key && styles.filterTextActive,
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  filterButtonActive: {
    backgroundColor: Colors.cyan,
  },
  filterText: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  filterTextActive: {
    color: '#000',
  },
});
