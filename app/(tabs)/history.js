// app/(tabs)/history.js
import React, { useState, useEffect, useCallback } from 'react';
import {
 View,
 Text,
 StyleSheet,
 FlatList,
 Image,
 TouchableOpacity,
 Alert,
 ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const MOOD_ENTRIES_KEY = 'moodEntries';


/**
* The screen for viewing past mood entries.
* This is now the 'History' tab.
*/
export default function MoodHistoryScreen() {
 const [moodEntries, setMoodEntries] = useState([]);


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


 useFocusEffect(
   useCallback(() => {
     loadMoodEntries();
     return () => {};
   }, [loadMoodEntries])
 );


 const deleteMoodEntry = (idToDelete) => {
   Alert.alert(
     'Delete Mood Entry',
     'Are you sure you want to delete this mood entry?',
     [
       {
         text: 'Cancel',
         style: 'cancel',
       },
       {
         text: 'Delete',
         onPress: async () => {
           try {
             const updatedEntries = moodEntries.filter(
               (entry) => entry.id !== idToDelete
             );
             setMoodEntries(updatedEntries);
             await AsyncStorage.setItem(MOOD_ENTRIES_KEY, JSON.stringify(updatedEntries));
             Alert.alert('Deleted', 'Mood entry removed.');
           } catch (error) {
             console.error('Error deleting mood entry:', error);
             Alert.alert('Error', 'Failed to delete mood entry.');
           }
         },
         style: 'destructive',
       },
     ],
     { cancelable: true }
   );
 };


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


   const moodOptions = [
     { mood: 'Happy', emoji: '�', color: '#8BC34A' },
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
       {/* Delete Button positioned at the top right edge */}
       <TouchableOpacity
         style={styles.deleteButton}
         onPress={() => deleteMoodEntry(item.id)}
       >
         <MaterialCommunityIcons name="close-circle" size={24} color="#FFF" />
       </TouchableOpacity>
     </View>
   );
 };


 return (
   <LinearGradient
     colors={['#E6E6FA', '#D8BFD8']} // Light Lavender to Thistle gradient
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
   position: 'relative', // Crucial for absolute positioning of delete button
 },
 entryHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between', // Keep space-between for mood and date/time
   alignItems: 'center',
   marginBottom: 10,
 },
 entryMood: {
   fontSize: 22,
   fontWeight: 'bold',
 },
 entryDate: { // This style is for the timestamp in the header
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
 // Adjusted style for the delete icon button to place it at the top right edge
 deleteButton: {
   position: 'absolute',
   top: 0, // Position at the very top edge
   right: 0, // Position at the very right edge
   backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent black background
   borderRadius: 15, // Keep rounded corners
   padding: 5, // Slightly increased padding to make it more tappable
   zIndex: 1, // Ensure it's above other content if there's overlap
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
