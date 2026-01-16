import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, Clock, Star, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';

const categories = [
  { id: '1', name: 'CYBERPUNK', icon: Zap, count: 234 },
  { id: '2', name: 'SPACE OPERA', icon: Star, count: 189 },
  { id: '3', name: 'POST-APOCALYPTIC', icon: TrendingUp, count: 156 },
  { id: '4', name: 'TIME TRAVEL', icon: Clock, count: 98 },
];

const trending = [
  {
    id: '1',
    title: 'NEURAL DECAY',
    author: 'GHOST_WIRE',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    views: '12.4K',
  },
  {
    id: '2',
    title: 'STEEL HORIZON',
    author: 'MECH_PILOT',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=200&fit=crop',
    views: '8.9K',
  },
  {
    id: '3',
    title: 'DATA STORM',
    author: 'CYBER_SAGE',
    image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=200&fit=crop',
    views: '7.2K',
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <GridBackground variant="ui" />
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>EXPLORE UNIVERSES</Text>
          <View style={styles.titleUnderline} />
        </View>

        <Text style={styles.subtitle}>CATEGORIES</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
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
            <TouchableOpacity key={item.id} style={styles.trendingCard}>
              <Image source={{ uri: item.image }} style={styles.trendingImage} />
              <View style={styles.trendingOverlay} />
              <View style={styles.trendingContent}>
                <Text style={styles.trendingTitle}>{item.title}</Text>
                <Text style={styles.trendingAuthor}>{item.author}</Text>
                <Text style={styles.trendingViews}>{item.views} views</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.subtitle}>FEATURED COLLECTIONS</Text>
        <TouchableOpacity style={styles.collectionBanner}>
          <View style={styles.collectionGradient}>
            <Text style={styles.collectionLabel}>CURATED</Text>
            <Text style={styles.collectionTitle}>BEST OF 2025</Text>
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
