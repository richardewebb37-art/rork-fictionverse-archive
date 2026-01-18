import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, Clock, Star, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';
import { Universe, getAllUniverses } from '@/services/firestore/universes.service';
import { getTrendingEntries, Entry } from '@/services/firestore/entries.service';

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
}

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<Category[]>([]);
  const [trending, setTrending] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExploreData();
  }, []);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch trending entries
      const trendingEntries = await getTrendingEntries(10);
      setTrending(trendingEntries);

      // Fetch universes for categories
      const universes = await getAllUniverses();
      const categoryData: Category[] = universes.map((universe: Universe, index: number) => ({
        id: universe.id,
        name: universe.name.toUpperCase(),
        icon: [Zap, Star, TrendingUp, Clock][index % 4],
        count: universe.entryCount || 0,
      }));
      
      setCategories(categoryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load explore data');
      console.error('Error fetching explore data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/',
      params: { category: categoryName }
    });
  };

  const handleTrendingPress = (id: string, title: string) => {
    router.push({
      pathname: '/modal',
      params: { id, title }
    });
  };

  const handleCollectionPress = () => {
    router.push({
      pathname: '/',
      params: { collection: 'best-of-2025' }
    });
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <GridBackground variant="ui" />
        <Header onProfilePress={handleProfilePress} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.cyan} />
          <Text style={styles.loadingText}>Loading explore data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GridBackground variant="ui" />
      <Header onProfilePress={handleProfilePress} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EXPLORE UNIVERSES</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.subtitle}>UNIVERSES</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.name)}
              >
                <IconComponent size={28} color={Colors.cyan} />
                <Text style={styles.categoryName}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{cat.count} ENTRIES</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subtitle}>TRENDING NOW</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScroll}
        >
          {trending.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.trendingCard}
              onPress={() => handleTrendingPress(item.id, item.title)}
            >
              <Image source={{ uri: item.coverImage || '' }} style={styles.trendingImage} />
              <View style={styles.trendingOverlay} />
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingAuthor}>by {item.authorName}</Text>
                <Text style={styles.trendingViews}>{(item.stats?.views || 0).toLocaleString()} views</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.subtitle}>FEATURED COLLECTIONS</Text>
        <TouchableOpacity 
          style={styles.collectionBanner}
          onPress={handleCollectionPress}
        >
          <View style={styles.collectionGradient}>
            <Text style={styles.collectionLabel}>CURATED</Text>
            <Text style={styles.collectionTitle}>BEST OF 2026</Text>
            <Text style={styles.collectionDesc}>Top rated fiction from the community</Text>
          </View>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: Colors.cyan,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  trendingScroll: {
    paddingRight: 16,
    gap: 12,
    marginBottom: 24,
  },
  trendingCard: {
    width: 160,
    height: 200,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 41, 0.6)',
  },
  trendingContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(10, 25, 41, 0.9)',
    borderTopWidth: 1,
    borderTopColor: Colors.cyan,
  },
  trendingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 0.5,
  },
  trendingAuthor: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  trendingViews: {
    fontSize: 10,
    color: Colors.amber,
    marginTop: 4,
  },
  collectionBanner: {
    height: 140,
    borderWidth: 2,
    borderColor: Colors.cyan,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
  },
  collectionGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  collectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.amber,
    letterSpacing: 2,
    marginBottom: 6,
  },
  collectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    marginBottom: 4,
  },
  collectionDesc: {
    fontSize: 14,
    color: Colors.white,
  },
});