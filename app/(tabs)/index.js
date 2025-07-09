import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

/**
 * Key used for storing and retrieving mood entries in AsyncStorage.
 * @type {string}
 */
const MOOD_ENTRIES_KEY = 'moodEntries';

/**
 * NewEntryScreen component allows users to log their current mood,
 * write a journal entry, and optionally attach a photo.
 * This component serves as the 'New Entry' tab in the application.
 *
 * @returns {JSX.Element} The rendered New Entry Screen.
 */
export default function NewEntryScreen() {
  /**
   * State hook to store the currently selected mood.
   * @type {[string|null, Function]}
   */
  const [selectedMood, setSelectedMood] = useState(null);
  /**
   * State hook to store the text entered in the journal.
   * @type {[string, Function]}
   */
  const [journalText, setJournalText] = useState('');
  /**
   * State hook to store the URI of the captured image.
   * @type {[string|null, Function]}
   */
  const [imageUri, setImageUri] = useState(null);

  /**
   * Array defining available mood options, including their display name,
   * corresponding emoji, and a color for styling.
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

  /**
   * Handles taking a picture using the device's camera.
   * Requests camera permissions, launches the camera, and if a photo is taken
   * successfully, sets the `imageUri` state with the URI of the captured image.
   * Displays alerts for permission denial or if the camera operation is cancelled.
   *
   * @returns {Promise<void>} A promise that resolves when the picture is taken or cancelled.
   */
  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  /**
   * Saves the current mood entry to AsyncStorage.
   * Validates if a mood has been selected. If not, an alert is displayed.
   * Constructs a new mood entry object with a unique ID and timestamp.
   * Retrieves existing entries from AsyncStorage, adds the new entry to the beginning,
   * and saves the updated list back to AsyncStorage.
   * Resets the form fields (selected mood, journal text, image URI) upon successful save.
   *
   * @returns {Promise<void>} A promise that resolves when the mood entry is saved.
   */
  const saveMoodEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Missing Mood', 'Please select your mood before saving!');
      return;
    }

    const timestampToSave = new Date().toISOString();

    const newEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      journalText: journalText,
      imageUri: imageUri,
      timestamp: timestampToSave, 
    };

    try {
      const storedEntries = await AsyncStorage.getItem(MOOD_ENTRIES_KEY);
      const currentEntries = storedEntries ? JSON.parse(storedEntries) : [];
      // Add the new entry at the beginning of the array
      const updatedEntries = [newEntry, ...currentEntries];
      await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(updatedEntries));

      Alert.alert('Success', 'Mood entry saved!');
      // Reset form fields
      setSelectedMood(null);
      setJournalText('');
      setImageUri(null);
      Keyboard.dismiss(); 
    } catch (error) {
      console.error('Error saving mood entry:', error);
      Alert.alert('Error', 'Failed to save mood entry.');
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.gradientBackground}
    >
      {/* TouchableWithoutFeedback to dismiss keyboard when tapping outside input fields */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.contentContainer}>
            {/* App Name */}
            <Text style={styles.appName}>MoodSnap</Text>
            {/* Subtitle providing a brief description */}
            <Text style={styles.subtitle}>Welcome to MoodSnap! Log your daily feelings and reflections.</Text>

            {/* Mood Selection Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
              <View style={styles.moodSelectorContainer}>
                {moodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.mood}
                    style={[
                      styles.moodButton,
                      { backgroundColor: option.color },
                      selectedMood === option.mood && styles.selectedMoodButton, 
                    ]}
                    onPress={() => setSelectedMood(option.mood)}
                  >
                    <Text style={styles.moodEmoji}>{option.emoji}</Text>
                    <Text style={styles.moodText}>{option.mood}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Journal Entry Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Journal Entry:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                multiline
                numberOfLines={4}
                value={journalText}
                onChangeText={setJournalText}
                placeholderTextColor="#999"
              />
            </View>

            {/* Camera Section Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Capture a moment:</Text>
              <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={saveMoodEntry}>
              <Text style={styles.saveButtonText}>Save Mood</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}

/**
 * StyleSheet for the NewEntryScreen component.
 * Defines the visual styles for the gradient background, containers, text,
 * mood selection buttons, text input, camera section, image preview, and save button.
 */
const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6A5ACD', 
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', 
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  card: {
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  moodSelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  moodButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 25,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedMoodButton: {
    borderColor: '#6A5ACD', 
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  textInput: {
    width: '100%',
    height: 120,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#F9F9F9',
    textAlignVertical: 'top', 
    fontSize: 16,
    color: '#333',
  },
  cameraButton: {
    backgroundColor: '#6A5ACD', 
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    alignSelf: 'center', 
  },
  cameraButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 15,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  saveButton: {
    backgroundColor: '#4CAF50', 
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});