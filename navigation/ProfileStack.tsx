import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Profile from '../screens/Profile';
import EditProfile from '../screens/EditProfile';
import ManageAddresses from '../screens/ManageAddresses';
import { ProfileStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'Edit Profile', headerTintColor: '#1E22A3' }} />
      <Stack.Screen name="ManageAddresses" component={ManageAddresses} options={{ title: 'Saved Addresses', headerTintColor: '#1E22A3' }} />
    </Stack.Navigator>
  );
}
