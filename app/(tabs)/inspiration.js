// app/(tabs)/inspiration.js
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const INSPIRATION_KEY = 'inspirationImages';

const { width: screenWidth } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const CARD_HORIZONTAL_MARGIN = 8;
const CONTAINER_HORIZONTAL_PADDING = 15;

const calculatedCardWidth =
  (screenWidth - (CONTAINER_HORIZONTAL_PADDING * 2) - (CARD_HORIZONTAL_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;


/**
 * The Inspiration Board screen.
 * Users can capture inspiring images, add notes (after photo), and view/delete their collection.
 */
export default function InspirationBoardScreen() {
  const [inspirationImages, setInspirationImages] = useState([]);

  useEffect(() => {
    loadInspirationImages();
  }, []);

  const loadInspirationImages = async () => {
    try {
      const storedImages = await AsyncStorage.getItem(INSPIRATION_KEY);
      if (storedImages !== null) {
        setInspirationImages(JSON.parse(storedImages));
      }
    } catch (error) {
      console.error('Error loading inspiration images:', error);
      Alert.alert('Error', 'Failed to load inspiration images.');
    }
  };

  const saveInspirationImages = async (images) => {
    try {
      await AsyncStorage.setItem(INSPIRATION_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving inspiration images:', error);
      Alert.alert('Error', 'Failed to save inspiration images.');
    }
  };

  const takeInspirationPicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos for your inspiration board.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;

      Alert.prompt(
        'Add a Note',
        'Enter a note for this inspiration photo (optional):',
        [
          {
            text: 'Cancel',
            onPress: () => {
              const updatedImages = [
                ...inspirationImages,
                { id: Date.now().toString(), uri: newImageUri, note: '' },
              ];
              setInspirationImages(updatedImages);
              saveInspirationImages(updatedImages);
              Alert.alert('Success', 'Image added without a note.');
            },
            style: 'cancel',
          },
          {
            text: 'Save',
            onPress: (noteText) => {
              const updatedImages = [
                ...inspirationImages,
                { id: Date.now().toString(), uri: newImageUri, note: noteText ? noteText.trim() : '' },
              ];
              setInspirationImages(updatedImages);
              saveInspirationImages(updatedImages);
              Alert.alert('Success', 'Image and note added to your Inspiration Board!');
            },
          },
        ],
        'plain-text'
      );
    }
  };

  const deleteImage = (idToDelete) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this inspiration image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            const updatedImages = inspirationImages.filter(
              (image) => image.id !== idToDelete
            );
            setInspirationImages(updatedImages);
            await saveInspirationImages(updatedImages);
            Alert.alert('Deleted', 'Image removed from your Inspiration Board.');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item.uri }} style={styles.inspirationImage} />
      {item.note && item.note.trim() !== '' && (
        <Text style={styles.imageNote}>{item.note}</Text>
      )}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteImage(item.id)}
      >
        <MaterialCommunityIcons name="close-circle" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']} // Light Lavender to Thistle gradient (MATCHING NEW ENTRY)
      style={styles.gradientBackground}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Inspiration Board</Text>
        <Text style={styles.subtitle}>Capture and cherish your motivating moments.</Text>

        <View style={styles.listArea}>
          {inspirationImages.length > 0 ? (
            <FlatList
              data={inspirationImages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.imageList}
            />
          ) : (
            <ScrollView contentContainerStyle={styles.emptyStateScrollView}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No inspiration yet! Tap "Add Inspiration Photo" to get started.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>

        <TouchableOpacity style={styles.cameraButton} onPress={takeInspirationPicture}>
          <Text style={styles.cameraButtonText}>Add Inspiration Photo</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: CONTAINER_HORIZONTAL_PADDING,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  listArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cameraButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageList: {
    paddingVertical: 10,
    alignSelf: 'center',
  },
  imageCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingBottom: 10,
    margin: CARD_HORIZONTAL_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    width: calculatedCardWidth,
  },
  inspirationImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 5,
  },
  imageNote: {
    fontSize: 14,
    color: '#444',
    paddingHorizontal: 8,
    textAlign: 'center',
    minHeight: 40,
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 1,
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
