import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orders from '../screens/Orders';
import OrderDetail from '../screens/OrderDetail';
import { OrdersStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export default function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrdersList" component={Orders} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetail} options={{ title: 'Order Details', headerTintColor: '#0f766e' }} />
    </Stack.Navigator>
  );
}
