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

/**
 * Key used for storing and retrieving inspiration images in AsyncStorage.
 * @type {string}
 */
const INSPIRATION_KEY = 'inspirationImages';

/**
 * Retrieves the full width of the device screen.
 * @type {number}
 */
const { width: screenWidth } = Dimensions.get('window');

/**
 * Defines the number of columns for the image grid in the Inspiration Board.
 * @type {number}
 */
const NUM_COLUMNS = 2;

/**
 * Defines the horizontal margin for each image card.
 * @type {number}
 */
const CARD_HORIZONTAL_MARGIN = 8;

/**
 * Defines the horizontal padding for the main content container.
 * @type {number}
 */
const CONTAINER_HORIZONTAL_PADDING = 15;

/**
 * Calculates the width of each image card to fit into the specified number of columns
 * with appropriate margins and padding.
 * @type {number}
 */
const calculatedCardWidth =
  (screenWidth - (CONTAINER_HORIZONTAL_PADDING * 2) - (CARD_HORIZONTAL_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;


/**
 * The Inspiration Board screen component.
 * This screen allows users to capture inspiring images, optionally add notes to them,
 * and view or delete their collection of inspiration photos.
 * It provides a visual board for motivational content.
 *
 * @returns {JSX.Element} The rendered Inspiration Board Screen.
 */
export default function InspirationBoardScreen() {
  /**
   * State hook to manage the array of inspiration images.
   * Each image object typically includes an `id`, `uri`, and `note`.
   * @type {[Array<Object>, Function]}
   */
  const [inspirationImages, setInspirationImages] = useState([]);

  /**
   * Effect hook to load inspiration images from AsyncStorage when the component mounts.
   */
  useEffect(() => {
    loadInspirationImages();
  }, []); // Empty dependency array ensures this runs only once on mount

  /**
   * Asynchronously loads inspiration images from AsyncStorage.
   * If stored images are found, they are parsed and set as the component's state.
   * Handles potential errors during data retrieval.
   *
   * @returns {Promise<void>} A promise that resolves when images are loaded.
   */
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

  /**
   * Asynchronously saves the current array of inspiration images to AsyncStorage.
   * Handles potential errors during data storage.
   *
   * @param {Array<Object>} images The array of image objects to save.
   * @returns {Promise<void>} A promise that resolves when images are saved.
   */
  const saveInspirationImages = async (images) => {
    try {
      await AsyncStorage.setItem(INSPIRATION_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving inspiration images:', error);
      Alert.alert('Error', 'Failed to save inspiration images.');
    }
  };

  /**
   * Initiates the process of taking an inspiration picture using the device's camera.
   * Requests camera permissions first. If granted, launches the camera.
   * Upon successful photo capture, it prompts the user to add an optional note.
   * The new image and its note (if any) are then added to the `inspirationImages` state
   * and saved to AsyncStorage.
   *
   * @returns {Promise<void>} A promise that resolves after the camera operation and saving.
   */
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

      // Prompt for a note after taking the picture
      Alert.prompt(
        'Add a Note',
        'Enter a note for this inspiration photo (optional):',
        [
          {
            text: 'Cancel',
            onPress: () => {
              // Add image without a note if cancelled
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
              // Add image with the entered note
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

  /**
   * Handles the deletion of a specific inspiration image.
   * Displays an alert to confirm the deletion. If confirmed, the image is removed
   * from the `inspirationImages` state and the updated list is saved back to AsyncStorage.
   *
   * @param {string} idToDelete The unique identifier of the image to be deleted.
   * @returns {void}
   */
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
            await saveInspirationImages(updatedImages); // Save changes to AsyncStorage
            Alert.alert('Deleted', 'Image removed from your Inspiration Board.');
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Renders an individual item for the FlatList, representing an inspiration image card.
   * Displays the image, its associated note (if any), and a delete button.
   *
   * @param {Object} props - The props for rendering a list item.
   * @param {Object} props.item - The inspiration image object to render.
   * @returns {JSX.Element} A React Native View component representing a single image card.
   */
  const renderItem = ({ item }) => (
    <View style={styles.imageCard}>
      <Image source={{ uri: item.uri }} style={styles.inspirationImage} />
      {item.note && item.note.trim() !== '' && ( // Only render note if it exists and isn't empty
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
      colors={['#E6E6FA', '#D8BFD8']} 
      style={styles.gradientBackground}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Inspiration Board</Text>
        <Text style={styles.subtitle}>Capture and cherish your motivating moments.</Text>

        <View style={styles.listArea}>
          {inspirationImages.length > 0 ? (
            // Display FlatList if there are images
            <FlatList
              data={inspirationImages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS} // Render items in two columns
              contentContainerStyle={styles.imageList}
            />
          ) : (
            // Display empty state message if no images
            <ScrollView contentContainerStyle={styles.emptyStateScrollView}>
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No inspiration yet! Tap "Add Inspiration Photo" to get started.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Button to add new inspiration photos */}
        <TouchableOpacity style={styles.cameraButton} onPress={takeInspirationPicture}>
          <Text style={styles.cameraButtonText}>Add Inspiration Photo</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}


/**
 * StyleSheet for the InspirationBoardScreen component.
 * Defines the visual styles for the gradient background, content containers,
 * titles, image cards, buttons, and empty state display.
 */
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