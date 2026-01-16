import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const TITLE_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/duk3nl9qw6latneasuu6r';

interface HeaderProps {
  onProfilePress?: () => void;
}

export default function Header({ onProfilePress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Image 
          source={{ uri: TITLE_URL }} 
          style={styles.title}
          resizeMode="contain"
        />
        
        <TouchableOpacity style={styles.iconButton} onPress={onProfilePress}>
          <User size={22} color={Colors.cyan} />
        </TouchableOpacity>
      </View>
      <View style={styles.borderGlow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 25, 41, 0.98)',
    borderBottomWidth: 2,
    borderBottomColor: Colors.cyan,
    ...Platform.select({
      ios: {
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0 0 20px ${Colors.glowCyan}`,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    width: 160,
    height: 32,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderWidth: 1.5,
    borderColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderGlow: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.cyan,
  },
});
