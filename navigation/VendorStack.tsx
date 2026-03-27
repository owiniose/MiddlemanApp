import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import VendorOrders from '../screens/vendor/VendorOrders';
import VendorMenu from '../screens/vendor/VendorMenu';
import VendorAddItem from '../screens/vendor/VendorAddItem';
import VendorEditItem from '../screens/vendor/VendorEditItem';
import VendorStoreSettings from '../screens/vendor/VendorStoreSettings';
import { VendorStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<VendorStackParamList>();

function MenuStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="VendorMenu" component={VendorMenu} options={{ headerShown: false }} />
      <Stack.Screen name="VendorAddItem" component={VendorAddItem} options={{ title: 'Add Menu Item', headerTintColor: '#0f766e' }} />
      <Stack.Screen name="VendorEditItem" component={VendorEditItem} options={{ title: 'Edit Menu Item', headerTintColor: '#0f766e' }} />
      <Stack.Screen name="VendorOrders" component={VendorOrders} options={{ headerShown: false }} />
      <Stack.Screen name="VendorStoreSettings" component={VendorStoreSettings} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { height: 70, paddingBottom: 14, paddingTop: 8, marginBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: React.ComponentProps<typeof Ionicons>['name']; inactive: React.ComponentProps<typeof Ionicons>['name'] }> = {
            Orders: { active: 'receipt', inactive: 'receipt-outline' },
            Menu:   { active: 'restaurant', inactive: 'restaurant-outline' },
            Store:  { active: 'storefront', inactive: 'storefront-outline' },
          };
          const ic = icons[route.name];
          return <Ionicons name={focused ? ic.active : ic.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Orders" component={VendorOrders} />
      <Tab.Screen name="Menu" component={MenuStack} />
      <Tab.Screen name="Store" component={VendorStoreSettings} />
    </Tab.Navigator>
  );
}
