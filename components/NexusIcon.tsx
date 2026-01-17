import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Colors from '@/constants/colors';

interface NexusIconProps {
  size?: number;
  color?: string;
  glow?: boolean;
}

export default function NexusIcon({ size = 24, color = '#00d4ff', glow = true }: NexusIconProps) {
  const glowAnim = useRef(new Animated.Value(0.8)).current;
  const buttonSize = size + 28; // Circle button size
  const iconSize = size + 12; // N icon size inside the circle

  useEffect(() => {
    if (glow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [glow]);

  return (
    <Animated.View 
      style={[
        styles.buttonContainer, 
        { 
          width: buttonSize, 
          height: buttonSize,
          opacity: glow ? glowAnim : 1,
        }
      ]}
    >
      <View style={[styles.circleButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}>
        <Svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* N-shaped lightning bolt: left stroke down, diagonal across, right stroke up higher */}
          <Path
            d="M5 20 L5 12 L19 12 L19 4"
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
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
        boxShadow: `0 0 20px ${Colors.glowCyan}`,
      },
    }),
  },
  circleButton: {
    backgroundColor: Colors.bgDeepBlue,
    borderWidth: 2,
    borderColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
});