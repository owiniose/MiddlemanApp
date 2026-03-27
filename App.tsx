import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ProfileProvider } from './context/ProfileContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import RootStack from './navigation/RootStack';
import VendorTabs from './navigation/VendorStack';
import AuthStack from './navigation/AuthStack';

function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!user || !profile) {
    return <AuthStack />;
  }

  if (profile.role === 'vendor') {
    return <VendorTabs />;
  }

  return <RootStack />;
}

export default function App() {
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
