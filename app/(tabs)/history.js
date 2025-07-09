import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Key used for storing and retrieving mood entries in AsyncStorage.
 * @type {string}
 */
const MOOD_ENTRIES_KEY = 'moodEntries';

/**
 * MoodHistoryScreen component displays a history of user's mood entries.
 * It allows users to view past entries, including their mood, date, journal text, and associated images.
 *
 * This component serves as the 'History' tab in the application.
 *
 * @returns {JSX.Element} The rendered Mood History Screen.
 */
export default function MoodHistoryScreen() {
  /**
   * State hook to manage the list of mood entries.
   * @type {[Array<Object>, Function]}
   */
  const [moodEntries, setMoodEntries] = useState([]);

  /**
   * Loads mood entries from AsyncStorage.
   * This function is memoized using `useCallback` to prevent unnecessary re-renders.
   * If entries are found, they are parsed from JSON and set as the component's state.
   * If no entries are found or an error occurs, an empty array is set, and an alert is shown.
   *
   * @returns {Promise<void>} A promise that resolves when mood entries are loaded.
   */
  const loadMoodEntries = useCallback(async () => {
    try {
      const storedEntries = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
      if (storedEntries !== null) {
        setMoodEntries(JSON.parse(storedEntries));
      } else {
        setMoodEntries([]);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
      Alert.alert('Error', 'Failed to load mood entries.');
    }
  }, []);

  /**
   * Effect hook that runs when the screen comes into focus.
   * It calls `loadMoodEntries` to refresh the displayed mood entries.
   * `useFocusEffect` is used here instead of `useEffect` to ensure data is fresh
   * whenever the user navigates back to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      loadMoodEntries();
      return () => {};
    }, [loadMoodEntries])
  );

  /**
   * Renders an individual mood entry card for the FlatList.
   * This function formats the date and time, determines the appropriate emoji and color
   * based on the mood, and displays the journal text and image if available.
   *
   * @param {Object} props - The props for rendering a list item.
   * @param {Object} props.item - The mood entry object to render.
   * @returns {JSX.Element} A React Native View component representing a single mood entry card.
   */
  const renderMoodEntry = ({ item }) => {
    const entryDate = new Date(item.timestamp);
    const formattedDate = entryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = entryDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    /**
     * Defines the available mood options with their corresponding emojis and colors.
     * @type {Array<Object>}
     */
    const moodOptions = [
      { mood: 'Happy', emoji: '😊', color: '#8BC34A' },
      { mood: 'Neutral', emoji: '😐', color: '#FFEB3B' },
      { mood: 'Sad', emoji: '😞', color: '#2196F3' },
      { mood: 'Anxious', emoji: '😟', color: '#FF9800' },
      { mood: 'Stressed', emoji: '😩', color: '#F44336' },
      { mood: 'Excited', emoji: '😃', color: '#FFD700' },
      { mood: 'Calm', emoji: '😌', color: '#66CDAA' },
      { mood: 'Angry', emoji: '😡', color: '#DC143C' },
    ];
    const moodOption = moodOptions.find(opt => opt.mood === item.mood);
    const moodEmoji = moodOption ? moodOption.emoji : '';
    const moodColor = moodOption ? moodOption.color : '#666';

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={[styles.entryMood, { color: moodColor }]}>
            {moodEmoji} {item.mood}
          </Text>
          <Text style={styles.entryDate}>{formattedDate} at {formattedTime}</Text>
        </View>
        {item.journalText ? (
          <Text style={styles.entryJournal}>{item.journalText}</Text>
        ) : null}
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.entryImage} />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.gradientBackground}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Mood Journey</Text>
        <Text style={styles.subtitle}>All your past vibes, right here.</Text>

        {moodEntries.length > 0 ? (
          <FlatList
            data={moodEntries}
            renderItem={renderMoodEntry}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.emptyStateScrollView}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No mood entries yet! Go to the "New Entry" tab to add your first vibe.
              </Text>
            </View>
          </ScrollView>
        )}
      </View>
    </LinearGradient>
  );
}

/**
 * StyleSheet for the MoodHistoryScreen component.
 * Defines the visual styles for the gradient background, containers, text,
 * mood entry cards, images, and buttons.
 */
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  flatListContent: {
    paddingBottom: 20,
    width: '100%',
  },
  entryCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryMood: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 14,
    color: '#888',
  },
  entryJournal: {
    fontSize: 16,
    color: '#444',
    marginBottom: 10,
  },
  entryImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: 'cover',
  },

  emptyStateScrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
});
