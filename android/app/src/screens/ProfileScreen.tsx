import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const ProfileItem = ({ icon, title, subtitle, onPress, color, isLast = false, colors }: any) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 18,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: colors.border,
    }}
  >
    <View style={{
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      borderWidth: 1,
      borderColor: colors.border
    }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: color || colors.text }}>{title}</Text>
      {subtitle && <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 2, fontWeight: '500' }}>{subtitle}</Text>}
    </View>
    <Text style={{ fontSize: 20, color: colors.subtext, fontWeight: '300' }}>›</Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title, colors }: { title: string, colors: any }) => (
  <Text style={{
    fontSize: 11,
    fontWeight: '900',
    color: colors.subtext,
    marginTop: 35,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 2,
  }}>
    {title}
  </Text>
);

const ProfileScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const user = auth().currentUser;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          setProfile(doc.data());
        }
        setLoading(false);
      });
    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to exit your session?", [
      { text: "Stay", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => {
          try { await auth().signOut(); navigation.replace('Login'); } catch { Alert.alert("Error", "Logout failed."); }
        }
      }
    ]);
  };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
       <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 24, 
        paddingTop: Platform.OS === 'ios' ? 10 : 20, 
        paddingBottom: 20, 
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
        >
          <Text style={{ fontSize: 18, color: colors.text, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Account Center</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={{ 
          marginTop: 20,
          backgroundColor: isDark ? '#1C1C1E' : '#1C1C1E', // Keep dark card for premium feel or use colors.card
          padding: 24,
          borderRadius: 30,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ 
              width: 60, height: 60, borderRadius: 20, backgroundColor: colors.primary, 
              justifyContent: 'center', alignItems: 'center', marginRight: 16,
              borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)'
            }}>
              <Text style={{ fontSize: 28 }}>🍕</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#FFFFFF' }}>{profile?.name || 'Gourmet User'}</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2, fontWeight: '500' }}>{user?.email}</Text>
            </View>
            <TouchableOpacity 
                onPress={() => navigation.navigate('EditProfile')}
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12 }}
            >
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 }} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
             <Text style={{ fontSize: 18, marginRight: 12 }}>📍</Text>
             <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 }}>Delivery Hub</Text>
                <Text style={{ fontSize: 14, color: '#FFFFFF', marginTop: 2, fontWeight: '600' }} numberOfLines={1}>{profile?.address || 'Set your primary address'}</Text>
             </View>
          </View>
        </View>

        {/* Sections */}
        <SectionHeader title="Food Delivery" colors={colors} />
        <ProfileItem icon="🛒" title="Your Orders" subtitle="Track or repeat previous meals" onPress={() => navigation.navigate('OrderHistory')} colors={colors} />
        <ProfileItem icon="🎟️" title="Vouchers & Deals" subtitle="Your active discounts" onPress={() => {}} isLast={true} colors={colors} />

        <SectionHeader title="Personal" colors={colors} />
        <ProfileItem icon="🏘️" title="Address Directory" subtitle="Manage your drop-off points" onPress={() => navigation.navigate('Address')} colors={colors} />
        <ProfileItem icon="💬" title="Registry Feedback" subtitle="Your feedback history" onPress={() => navigation.navigate('Feedback')} isLast={true} colors={colors} />

        {profile?.role === 'admin' && (
          <>
            <SectionHeader title="Administration" colors={colors} />
            <ProfileItem icon="🛡️" title="Control Center" subtitle="System-wide operations" onPress={() => navigation.navigate('Admin')} colors={colors} isLast={true} />
          </>
        )}
        
        {profile?.role === 'restaurant' && (
          <>
            <SectionHeader title="Management" colors={colors} />
            <ProfileItem icon="🏪" title="Merchant Portal" subtitle="Manage your kitchen assets" onPress={() => navigation.navigate('Restaurant')} colors={colors} isLast={true} />
          </>
        )}

        <SectionHeader title="Settings" colors={colors} />
        <ProfileItem icon="✨" title="Appearance" subtitle={isDark ? "Dark theme enabled" : "Light theme enabled"} onPress={() => navigation.navigate('Settings')} colors={colors} />
        <ProfileItem icon="⚙️" title="App Settings" subtitle="Privacy, Notifications, Data" onPress={() => navigation.navigate('Settings')} isLast={true} colors={colors} />

        <SectionHeader title="Account Actions" colors={colors} />
        <ProfileItem icon="🚪" title="Identity Logout" subtitle="Securely sign out of session" color="#DC2626" onPress={handleLogout} isLast={true} colors={colors} />

        {/* Footer Version */}
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text style={{ fontSize: 10, color: colors.subtext, fontWeight: '800', letterSpacing: 3 }}>FOODEXPRESS PREMIUM</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
