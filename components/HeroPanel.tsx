import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const LOGO_URL = 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/duk3nl9qw6latneasuu6r';

interface HeroPanelProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export default function HeroPanel({ 
  title = 'Welcome to the Archive', 
  subtitle = 'The central hub for original and inspired constructivist fiction',
  showLogo = true 
}: HeroPanelProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0, 212, 255, 0.15)', 'rgba(0, 212, 255, 0.02)']}
        style={styles.gradient}
      />
      
      {showLogo && (
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: LOGO_URL }} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: Colors.cyan,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '900' as const,
    color: Colors.cyan,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 20,
  },
});
