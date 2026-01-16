import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookMarked, Clock, Heart, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';

type LibraryTab = 'saved' | 'history' | 'favorites';

const savedItems = [
  {
    id: '1',
    title: 'THE GEARWORK PROTOCOL',
    author: 'NEXUS_7',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    savedDate: '2 days ago',
  },
  {
    id: '2',
    title: 'QUANTUM ECHOES',
    author: 'VOID_WALKER',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=100&h=100&fit=crop',
    savedDate: '1 week ago',
  },
];

const historyItems = [
  {
    id: '1',
    title: 'NEON RAIN',
    author: 'CIPHER_X',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop',
    readDate: 'Today',
    progress: 75,
  },
  {
    id: '2',
    title: 'CHROME DYNASTY',
    author: 'SYNTH_MIND',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&h=100&fit=crop',
    readDate: 'Yesterday',
    progress: 100,
  },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<LibraryTab>('saved');

  const tabs: { key: LibraryTab; label: string; icon: typeof BookMarked }[] = [
    { key: 'saved', label: 'SAVED', icon: BookMarked },
    { key: 'history', label: 'HISTORY', icon: Clock },
    { key: 'favorites', label: 'FAVORITES', icon: Heart },
  ];

  return (
    <View style={styles.container}>
      <GridBackground variant="archive" />
      <Header />
      
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
            {savedItems.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemAuthor}>{item.author}</Text>
                  <Text style={styles.itemMeta}>Saved {item.savedDate}</Text>
                </View>
                <TouchableOpacity style={styles.deleteButton}>
                  <Trash2 size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.listContainer}>
            {historyItems.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemAuthor}>{item.author}</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
                  </View>
                  <Text style={styles.itemMeta}>
                    {item.progress === 100 ? 'Completed' : `${item.progress}% read`} • {item.readDate}
                  </Text>
                </View>
              </View>
            ))}
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
  progressContainer: {
    height: 3,
    backgroundColor: Colors.inputBg,
    marginTop: 6,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.cyan,
    borderRadius: 2,
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
