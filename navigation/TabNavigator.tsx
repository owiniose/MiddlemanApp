import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import SearchStack from './SearchStack';
import OrdersStack from './OrdersStack';
import Support from '../screens/Support';
import ProfileStack from './ProfileStack';
import AiAssistant from '../screens/AiAssistant';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Home:    { active: 'home',          inactive: 'home-outline' },
  Search:  { active: 'search',        inactive: 'search-outline' },
  Orders:  { active: 'bag-handle',    inactive: 'bag-handle-outline' },
  Support: { active: 'help-circle',   inactive: 'help-circle-outline' },
  Profile: { active: 'person',        inactive: 'person-outline' },
};

function AiFab({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name="sparkles" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

export default function TabNavigator() {
  const [aiVisible, setAiVisible] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const icons = ICONS[route.name];
            const name = focused ? icons.active : icons.inactive;
            return <Ionicons name={name} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#1E22A3',
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
        <Tab.Screen name="Home"    component={HomeStack} />
        <Tab.Screen name="Search"  component={SearchStack} />
        <Tab.Screen name="Orders"  component={OrdersStack} />
        <Tab.Screen name="Support" component={Support} options={{ tabBarLabel: 'Support' }} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>

      <AiFab onPress={() => setAiVisible(true)} />

      <Modal
        visible={aiVisible}
        animationType="slide"
        onRequestClose={() => setAiVisible(false)}
      >
        <AiAssistant onClose={() => setAiVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E22A3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
