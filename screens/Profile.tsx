import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import Text from '../components/Text';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation';
import { useProfile } from '../context/ProfileContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export default function Profile({ navigation }: Props) {
  const { addresses } = useProfile();
  const { orders } = useOrders();
  const { logOut, profile: authProfile } = useAuth();
  const name = authProfile?.name ?? '';
  const phone = authProfile?.phone ?? '';
  const email = authProfile?.email ?? '';
  const [notifications, setNotifications] = React.useState(true);

  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Profile</Text>

        {/* Avatar + info */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{name || 'No name set'}</Text>
            <Text style={styles.avatarSub}>{phone || 'No phone set'}</Text>
            {email ? <Text style={styles.avatarSub}>{email}</Text> : null}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <Ionicons name="pencil" size={16} color="#0f766e" />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            label="Edit Profile"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <Divider />
          <MenuItem
            icon="location-outline"
            label="Saved Addresses"
            onPress={() => navigation.navigate('ManageAddresses')}
          />
          <Divider />
          <View style={styles.menuRow}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={20} color="#374151" />
              <Text style={styles.menuLabel}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: '#0f766e', false: '#e5e7eb' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Activity */}
        <Text style={styles.sectionLabel}>Activity</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="bag-handle-outline"
            label="Order History"
            value={`${orders.length} orders`}
            onPress={() => navigation.getParent()?.navigate('Orders')}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="help-circle-outline" label="Help & FAQ" onPress={() => navigation.getParent()?.navigate('Support')} />
          <Divider />
          <MenuItem icon="chatbubble-outline" label="Contact Us" onPress={() => navigation.getParent()?.navigate('Support')} />
          <Divider />
          <MenuItem icon="information-circle-outline" label="About MiddlemanApp" value="v1.0.0" onPress={() => {}} />
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, value, onPress }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={20} color="#374151" />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { padding: 16 },
  header: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },

  avatarCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, elevation: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  avatarInfo: { flex: 1 },
  avatarName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  avatarSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  editBtn: { padding: 8, backgroundColor: '#f0fdf4', borderRadius: 20 },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginLeft: 4 },
  menuCard: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 20, elevation: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuLabel: { fontSize: 15, color: '#111827' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13, color: '#6b7280' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 48 },

  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 14, elevation: 1 },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 15 },
});
