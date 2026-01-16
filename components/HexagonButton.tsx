import React from 'react';
import { StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import Colors from '@/constants/colors';

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/wnu1jf5q8yjnjz550rtbn';

interface HexagonButtonProps {
  onPress?: () => void;
}

export default function HexagonButton({ onPress }: HexagonButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <Image 
        source={{ uri: LOGO_URL }} 
        style={styles.logo}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.cyan,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
      web: {
        filter: `drop-shadow(0 0 10px ${Colors.glowCyan})`,
      },
    }),
  },
  logo: {
    width: 60,
    height: 60,
  },
});
