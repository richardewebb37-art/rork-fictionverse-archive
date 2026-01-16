import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';
import { AlertTriangle, Home } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'NOT FOUND', headerShown: false }} />
      <View style={styles.container}>
        <GridBackground />
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <AlertTriangle size={64} color={Colors.amber} />
          </View>
          
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>SECTOR NOT FOUND</Text>
          <Text style={styles.description}>
            The archive sector you are looking for has been relocated or does not exist in this timeline.
          </Text>
          
          <Link href="/" asChild>
            <TouchableOpacity style={styles.button}>
              <Home size={18} color="#000" />
              <Text style={styles.buttonText}>RETURN TO ARCHIVE</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeepBlue,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: Colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 3,
    marginTop: 8,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cyan,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1.5,
  },
});
