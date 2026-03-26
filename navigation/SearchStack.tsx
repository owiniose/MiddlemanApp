import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Search from '../screens/Search';
import VendorDetail from '../screens/VendorDetail';
import { SearchStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export default function SearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SearchScreen" component={Search} options={{ headerShown: false }} />
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
