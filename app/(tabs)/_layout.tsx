import { Tabs } from 'expo-router';
import { Home, Compass, BookOpen, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import NexusIcon from '@/components/NexusIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.cyan,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 25, 41, 0.98)',
          borderTopWidth: 2,
          borderTopColor: Colors.cyan,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          ...Platform.select({
            web: {
              boxShadow: `0 -4px 20px ${Colors.glowCyan}`,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, size }) => <NexusIcon color={color} size={size + 8} glow={true} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});