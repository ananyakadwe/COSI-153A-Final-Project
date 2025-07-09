// app/_layout.js
import { Stack } from 'expo-router';

/**
 * Root layout component for Expo Router.
 * This layout primarily renders the (tabs) group,
 * which contains all the tab-based screens.
 * The 'headerShown: false' option hides the default header for the root stack,
 * as the tabs themselves will have their own headers defined in (tabs)/_layout.js.
 */
export default function RootLayout() {
  return (
    <Stack>
      {/* This Stack.Screen points to the (tabs) group.
          It ensures that the tab navigation is rendered within the main app stack. */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* You could add other screens here that are not part of the tabs,
          e.g., a modal screen, a login screen that appears before tabs, etc. */}
    </Stack>
  );
}
