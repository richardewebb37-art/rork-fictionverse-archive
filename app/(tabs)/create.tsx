import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Edit3, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import GridBackground from '@/components/GridBackground';
import Header from '@/components/Header';

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [storyType, setStoryType] = useState<'original' | 'inspired'>('original');

  return (
    <View style={styles.container}>
      <GridBackground variant="ui" opacity={0.2} />
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Edit3 size={40} color={Colors.cyan} />
          <Text style={styles.pageTitle}>CREATE NEW ENTRY</Text>
          <Text style={styles.pageSubtitle}>Share your story with the universe</Text>
        </View>

        <Text style={styles.label}>ENTRY TYPE</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, storyType === 'original' && styles.typeButtonActive]}
            onPress={() => setStoryType('original')}
          >
            <Sparkles size={20} color={storyType === 'original' ? '#000' : Colors.cyan} />
            <Text style={[styles.typeText, storyType === 'original' && styles.typeTextActive]}>
              ORIGINAL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, storyType === 'inspired' && styles.typeButtonActive]}
            onPress={() => setStoryType('inspired')}
          >
            <Feather size={20} color={storyType === 'inspired' ? '#000' : Colors.amber} />
            <Text style={[styles.typeText, storyType === 'inspired' && styles.typeTextActive]}>
              INSPIRED
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>TITLE</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="ENTER TITLE..."
          placeholderTextColor={Colors.textMuted}
        />

        {storyType === 'inspired' && (
          <>
            <Text style={styles.label}>INSPIRED BY</Text>
            <TextInput
              style={styles.input}
              placeholder="ORIGINAL WORK NAME..."
              placeholderTextColor={Colors.textMuted}
            />
          </>
        )}

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write a brief description..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>CONTENT</Text>
        <TextInput
          style={[styles.input, styles.contentArea]}
          placeholder="Begin your story here..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>PUBLISH ENTRY</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.draftButton}>
          <Text style={styles.draftText}>SAVE AS DRAFT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeepBlue,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    marginTop: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: 10,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  typeButtonActive: {
    backgroundColor: Colors.cyan,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  typeTextActive: {
    color: '#000',
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    padding: 14,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },
  contentArea: {
    height: 200,
    paddingTop: 14,
  },
  submitButton: {
    backgroundColor: Colors.cyan,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  draftButton: {
    borderWidth: 1,
    borderColor: Colors.cyan,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  draftText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
});
