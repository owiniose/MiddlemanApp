import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import RootStack from './navigation/RootStack';
import VendorTabs from './navigation/VendorStack';
import AdminTabs from './navigation/AdminStack';
import AuthStack from './navigation/AuthStack';
import { registerForPushNotificationsAsync, savePushToken } from './utils/notifications';

function AppNavigator() {
  const { user, profile, loading } = useAuth();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);

  // Register for push notifications whenever a user logs in
  useEffect(() => {
    if (!user) return;
    registerForPushNotificationsAsync().then((token) => {
      if (token) savePushToken(user.uid, token);
    });

    // Show an alert banner when a notification arrives while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification is shown automatically via setNotificationHandler in utils/notifications.ts
    });

    return () => {
      notificationListener.current?.remove();
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!user || !profile) return <AuthStack />;
  if (profile.role === 'vendor') return <VendorTabs />;
  if (profile.role === 'admin') return <AdminTabs />;
  return <RootStack />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileProvider>
          <OrdersProvider>
            <CartProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </CartProvider>
          </OrdersProvider>
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
