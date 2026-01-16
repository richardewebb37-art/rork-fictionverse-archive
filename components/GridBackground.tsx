import React from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

export type BackgroundVariant = 'ui' | 'geometric' | 'archive';

const BACKGROUND_IMAGES: Record<BackgroundVariant, string> = {
  ui: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/8y0kakz9cvbajp6nb9o3b',
  geometric: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/xl24krqp2k0pakvjc11ze',
  archive: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/l7dcasob3a5zvc3c1upfb',
};

const { width, height } = Dimensions.get('window');

interface GridBackgroundProps {
  variant?: BackgroundVariant;
  opacity?: number;
}

export default function GridBackground({ variant = 'geometric', opacity = 0.25 }: GridBackgroundProps) {
  const gridLines = [];
  const spacing = 40;
  
  for (let i = 0; i < Math.ceil(width / spacing); i++) {
    gridLines.push(
      <View
        key={`v-${i}`}
        style={[styles.verticalLine, { left: i * spacing }]}
      />
    );
  }
  
  for (let i = 0; i < Math.ceil(height / spacing); i++) {
    gridLines.push(
      <View
        key={`h-${i}`}
        style={[styles.horizontalLine, { top: i * spacing }]}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.bgDeepBlue, Colors.bgDarker]}
        style={StyleSheet.absoluteFillObject}
      />
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGES[variant] }}
        style={StyleSheet.absoluteFillObject}
        imageStyle={[styles.backgroundImage, { opacity }]}
        resizeMode="cover"
      />
      <View style={styles.gridOverlay}>
        {gridLines}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.gridLine,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gridLine,
  },
  backgroundImage: {
    opacity: 0.25,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
});
