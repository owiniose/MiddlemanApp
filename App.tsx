import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ProfileProvider } from './context/ProfileContext';
import RootStack from './navigation/RootStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <OrdersProvider>
          <CartProvider>
            <NavigationContainer>
              <RootStack />
            </NavigationContainer>
          </CartProvider>
        </OrdersProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
