import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../screens/Home';
import CategoryList from '../screens/CategoryList';
import VendorDetail from '../screens/VendorDetail';
import { HomeStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={Home} options={{ headerShown: false }} />
      <Stack.Screen
        name="CategoryList"
        component={CategoryList}
        options={({ route }) => ({ title: route.params.category, headerTintColor: '#1E22A3' })}
      />
      <Stack.Screen
        name="VendorDetail"
        component={VendorDetail}
        options={{
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
