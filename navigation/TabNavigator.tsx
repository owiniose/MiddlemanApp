import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import SearchStack from './SearchStack';
import OrdersStack from './OrdersStack';
import Support from '../screens/Support';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:    { active: 'home',          inactive: 'home-outline' },
  Search:  { active: 'search',        inactive: 'search-outline' },
  Orders:  { active: 'bag-handle',    inactive: 'bag-handle-outline' },
  Support: { active: 'chatbubble',    inactive: 'chatbubble-outline' },
  Profile: { active: 'person',        inactive: 'person-outline' },
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = ICONS[route.name];
          const name = focused ? icons.active : icons.inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: 70,
          paddingBottom: 14,
          paddingTop: 8,
          borderTopColor: '#e5e7eb',
          marginBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchStack} />
      <Tab.Screen name="Orders" component={OrdersStack} />
      <Tab.Screen name="Support" component={Support} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
