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
        tabBarActiveTintColor: '#6A5ACD', 
        tabBarInactiveTintColor: '#888', 
        tabBarStyle: {
          backgroundColor: '#FFF', 
          borderTopWidth: 1, 
          borderTopColor: '#EEE', 
          paddingBottom: 5, 
          height: 60, 
        },
        headerStyle: {
          backgroundColor: '#6A5ACD', 
        },
        headerTintColor: '#fff', 
        headerTitleStyle: {
          fontWeight: 'bold', 
        },
      }}
    >
      {/* Tab for New Entry Screen (corresponds to app/(tabs)/index.js) */}
      <Tabs.Screen
        name="index" 
        options={{
          title: 'New Entry', 
          tabBarLabel: 'New Entry', 
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pencil-plus" color={color} size={size} />
          ),
        }}
      />

      {/* Tab for Mood History Screen (corresponds to app/(tabs)/history.js) */}
      <Tabs.Screen
        name="history" 
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
        name="inspiration" 
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
