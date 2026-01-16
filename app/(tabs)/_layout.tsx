import { Tabs } from 'expo-router';
import { Home, Compass, BookOpen, User } from 'lucide-react-native';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import HexagonButton from '@/components/HexagonButton';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 25, 41, 0.98)',
          borderTopWidth: 2,
          borderTopColor: Colors.cyan,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: 8,
          ...Platform.select({
            web: {
              boxShadow: `0 -4px 20px ${Colors.glowCyan}`,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'EXPLORE',
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.hexContainer}>
              <HexagonButton />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'LIBRARY',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  hexContainer: {
    marginTop: -10,
  },
});
