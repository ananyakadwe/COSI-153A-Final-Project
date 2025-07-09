// app/(tabs)/_layout.js
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons for tab bar
import { Tabs } from 'expo-router';

/**
 * Layout component for the tab navigation.
 * Defines the tab bar, including icons, labels, and header options for each tab.
 * 'screenOptions' apply to all tabs unless overridden by individual Tabs.Screen options.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6A5ACD', // Color for the active tab icon and label
        tabBarInactiveTintColor: '#888', // Color for inactive tab icons and labels
        tabBarStyle: {
          backgroundColor: '#FFF', // White background for the tab bar
          borderTopWidth: 1, // Thin line at the top of the tab bar
          borderTopColor: '#EEE', // Light grey border color
          paddingBottom: 5, // Adds a little padding at the bottom for better visual
          height: 60, // Sets a fixed height for the tab bar
        },
        headerStyle: {
          backgroundColor: '#6A5ACD', // Purple background for the header bar of each tab screen
        },
        headerTintColor: '#fff', // White text color for the header title
        headerTitleStyle: {
          fontWeight: 'bold', // Bold font for the header title
        },
      }}
    >
      {/* Tab for New Entry Screen (corresponds to app/(tabs)/index.js) */}
      <Tabs.Screen
        name="index" // The file name without the extension (index.js)
        options={{
          title: 'New Entry', // Title displayed in the header bar of this screen
          tabBarLabel: 'New Entry', // Label displayed under the tab icon in the tab bar
          tabBarIcon: ({ color, size }) => (
            // Icon for this tab, using MaterialCommunityIcons
            <MaterialCommunityIcons name="pencil-plus" color={color} size={size} />
          ),
        }}
      />

      {/* Tab for Mood History Screen (corresponds to app/(tabs)/history.js) */}
      <Tabs.Screen
        name="history" // The file name without the extension (history.js)
        options={{
          title: 'Mood History',
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />

      {/* Tab for Inspiration Board Screen (corresponds to app/(tabs)/inspiration.js) */}
      <Tabs.Screen
        name="inspiration" // The file name without the extension (inspiration.js)
        options={{
          title: 'Inspiration Board',
          tabBarLabel: 'Inspiration',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="lightbulb-on" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
