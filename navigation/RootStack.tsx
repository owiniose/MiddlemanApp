import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import Cart from '../screens/Cart';
import Checkout from '../screens/Checkout';
import OrderConfirmation from '../screens/OrderConfirmation';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={Cart} options={{ title: 'Your Cart', headerTintColor: '#0f766e' }} />
      <Stack.Screen name="Checkout" component={Checkout} options={{ title: 'Checkout', headerTintColor: '#0f766e' }} />
      <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
