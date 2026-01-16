import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { X, Heart, Share2, BookmarkPlus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <GridBackground />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={Colors.cyan} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={20} color={Colors.cyan} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <BookmarkPlus size={20} color={Colors.cyan} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={Colors.cyan} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ORIGINAL WORK</Text>
        </View>

        <Text style={styles.title}>ENTRY DETAILS</Text>
        <Text style={styles.author}>by AUTHOR_NAME</Text>

        <View style={styles.metaContainer}>
          <Text style={styles.metaItem}>12 min read</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaItem}>2.4K views</Text>
          <View style={styles.metaDivider} />
          <Text style={styles.metaItem}>856 likes</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.bodyText}>
          This is where the full entry content would be displayed. The modal provides 
          an immersive reading experience with the signature cyberpunk aesthetic of 
          The Fictionverse archive.
        </Text>

        <Text style={styles.bodyText}>
          Navigate through the digital corridors of imagination, where every story 
          is a portal to another dimension of creative expression.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeepBlue,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statusBadge: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    fontSize: 12,
    color: Colors.cyanLight,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 12,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.cardBorder,
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 26,
    marginBottom: 20,
  },
});
