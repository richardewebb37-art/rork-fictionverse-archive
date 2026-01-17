import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Heart, Share2, BookmarkPlus, Clock, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import { fictionEntries } from '@/mocks/fictionEntries';

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string }>();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Find the entry based on ID or use default content
  const entry = params.id ? fictionEntries.find(e => e.id === params.id) : null;
  
  const title = entry?.title || params.title || 'ENTRY DETAILS';
  const author = entry?.author || 'AUTHOR_NAME';
  const description = entry?.description || 'This is where the full entry content would be displayed.';
  const status = entry?.status || 'original';
  const inspiredBy = entry?.inspiredBy;
  const readTime = entry?.readTime || '12 min';
  const coverImage = entry?.coverImage;
  const initialLikes = entry?.likes || 856;

  // Initialize like count
  React.useEffect(() => {
    setLikeCount(initialLikes);
  }, [initialLikes]);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from Library' : 'Saved to Library',
      isSaved ? 'Entry removed from your saved items.' : 'Entry has been saved to your library.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share Entry',
      'Share this entry with others',
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Link Copied', 'Entry link copied to clipboard.') },
        { text: 'Share to...', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GridBackground />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={Colors.cyan} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.actionButtonActive]} 
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={isLiked ? '#000' : Colors.cyan} 
              fill={isLiked ? '#000' : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, isSaved && styles.actionButtonSaved]} 
            onPress={handleSave}
          >
            <BookmarkPlus 
              size={20} 
              color={isSaved ? '#000' : Colors.cyan} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color={Colors.cyan} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {coverImage && (
          <View style={styles.coverContainer}>
            <Image source={{ uri: coverImage }} style={styles.coverImage} />
            <View style={styles.coverOverlay} />
          </View>
        )}

        <View style={[
          styles.statusBadge,
          status === 'inspired' && styles.statusBadgeInspired
        ]}>
          <Text style={styles.statusText}>
            {status === 'original' ? 'ORIGINAL WORK' : `INSPIRED BY [${inspiredBy}]`}
          </Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.author}>by {author}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.cyanLight} />
            <Text style={styles.metaText}>{readTime} read</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Eye size={14} color={Colors.cyanLight} />
            <Text style={styles.metaText}>2.4K views</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Heart size={14} color={Colors.cyanLight} />
            <Text style={styles.metaText}>{likeCount.toLocaleString()} likes</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>DESCRIPTION</Text>
        <Text style={styles.bodyText}>{description}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>CONTENT</Text>
        <Text style={styles.bodyText}>
          Navigate through the digital corridors of imagination, where every story 
          is a portal to another dimension of creative expression. The neon lights 
          flicker overhead as you descend deeper into the archive, each entry a 
          fragment of someone's vision made manifest in the digital ether.
        </Text>

        <Text style={styles.bodyText}>
          The construct hums with potential energy, waiting for the next mind to 
          interface with its vast repository of human creativity. Here, in the 
          space between thought and reality, stories come alive.
        </Text>

        <Text style={styles.bodyText}>
          Data streams cascade through neural pathways, each bit carrying the 
          weight of imagination. The archive grows, expands, evolves—a living 
          testament to the boundless nature of human creativity in the digital age.
        </Text>

        <View style={styles.authorSection}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>{author.charAt(0)}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{author}</Text>
            <Text style={styles.authorBio}>Creator in The Fictionverse</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>FOLLOW</Text>
          </TouchableOpacity>
        </View>
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
  actionButtonActive: {
    backgroundColor: Colors.cyan,
    borderColor: Colors.cyan,
  },
  actionButtonSaved: {
    backgroundColor: Colors.amber,
    borderColor: Colors.amber,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    marginBottom: 20,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  statusBadge: {
    backgroundColor: Colors.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusBadgeInspired: {
    backgroundColor: Colors.amber,
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
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
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
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 26,
    marginBottom: 20,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
    marginTop: 24,
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  authorBio: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cyan,
  },
  followButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
});