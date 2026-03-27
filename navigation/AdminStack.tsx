import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsers from '../screens/admin/AdminUsers';
import AdminVendors from '../screens/admin/AdminVendors';
import AdminOrders from '../screens/admin/AdminOrders';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Dashboard: { active: 'grid',        inactive: 'grid-outline' },
  Users:     { active: 'people',      inactive: 'people-outline' },
  Vendors:   { active: 'storefront',  inactive: 'storefront-outline' },
  Orders:    { active: 'receipt',     inactive: 'receipt-outline' },
};

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { height: 70, paddingBottom: 14, paddingTop: 8, marginBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const ic = TAB_ICONS[route.name];
          return <Ionicons name={focused ? ic.active : ic.inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboard} />
      <Tab.Screen name="Users"     component={AdminUsers} />
      <Tab.Screen name="Vendors"   component={AdminVendors} />
      <Tab.Screen name="Orders"    component={AdminOrders} />
    </Tab.Navigator>
  );
}
