import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Entry } from '@/services/firestore/entries.service';

interface FictionCardProps {
  entry: Entry;
  onPress: () => void;
}

export default function FictionCard({ entry, onPress }: FictionCardProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        testID={`fiction-card-${entry.id}`}
      >
        <View style={styles.coverContainer}>
          <Image source={{ uri: entry.coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
        </View>
        
        <View style={styles.content}>
          <View style={[
            styles.statusBadge,
            entry.type === 'original' ? styles.statusOriginal : styles.statusInspired
          ]}>
            <Text style={styles.statusText}>
              {entry.type === 'original' ? 'ORIGINAL WORK' : `INSPIRED BY [${entry.inspiredBy}]`}
            </Text>
          </View>
          
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.description} numberOfLines={2}>{entry.description}</Text>
          
          <View style={styles.meta}>
            <Text style={styles.author}>{entry.authorName}</Text>
            <View style={styles.stats}>
              <Heart size={14} color={Colors.cyan} fill={Colors.cyan} />
              <Text style={styles.likes}>{entry.stats?.likes.toLocaleString()}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.readButton} onPress={onPress}>
            <Text style={styles.readButtonText}>READ ENTRY</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.cardBorder,
    marginBottom: 20,
    overflow: 'hidden',
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  content: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cyan,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  statusOriginal: {
    backgroundColor: Colors.cyan,
  },
  statusInspired: {
    backgroundColor: Colors.amber,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.cyan,
    letterSpacing: 1,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  author: {
    fontSize: 12,
    color: Colors.cyanLight,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likes: {
    fontSize: 12,
    color: Colors.cyan,
    fontWeight: '600' as const,
  },
  readButton: {
    borderWidth: 1,
    borderColor: Colors.cyan,
    paddingVertical: 12,
    alignItems: 'center',
  },
  readButtonText: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
  },
});
