import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import auth from '@react-native-firebase/auth';

const SettingItem = ({ icon, title, value, onToggle, onPress, type = 'toggle', color, isLast = false }: any) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      activeOpacity={type === 'link' ? 0.7 : 1}
      onPress={type === 'link' ? onPress : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: colors.background,
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
      </View>
      {type === 'toggle' ? (
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: '#D1D1D6', true: '#4338CA' }}
          thumbColor={Platform.OS === 'ios' ? undefined : '#FFFFFF'}
        />
      ) : (
        <Text style={{ fontSize: 18, color: colors.subtext }}>›</Text>
      )}
    </TouchableOpacity>
  );
};

const SettingsScreen = ({ navigation }: any) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Request Received", "Our support team will process this request within 48 hours.") }
      ]
    );
  };

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
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <Text style={{ fontSize: 12, fontWeight: '900', color: colors.subtext, marginTop: 30, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Appearance</Text>
        <View style={{ backgroundColor: colors.card, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
          <SettingItem 
            icon={isDark ? "🌙" : "☀️"} 
            title="Dark Mode" 
            value={isDark} 
            onToggle={toggleTheme} 
            isLast={true}
          />
        </View>

        <Text style={{ fontSize: 12, fontWeight: '900', color: colors.subtext, marginTop: 40, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Notifications</Text>
        <View style={{ backgroundColor: colors.card, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
          <SettingItem 
            icon="🔔" 
            title="Push Notifications" 
            value={notifications} 
            onToggle={setNotifications} 
          />
          <SettingItem 
            icon="📧" 
            title="Marketing Emails" 
            value={marketing} 
            onToggle={setMarketing} 
            isLast={true}
          />
        </View>

        <Text style={{ fontSize: 12, fontWeight: '900', color: colors.subtext, marginTop: 40, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 }}>Security & Data</Text>
        <View style={{ backgroundColor: colors.card, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border }}>
          <SettingItem 
            icon="🔏" 
            title="Privacy Policy" 
            type="link" 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="📄" 
            title="Terms of Service" 
            type="link" 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="🗑️" 
            title="Delete Account" 
            type="link" 
            color="#DC2626"
            onPress={handleDeleteAccount}
            isLast={true}
          />
        </View>

        <View style={{ marginTop: 60, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: colors.subtext, fontWeight: '600' }}>Logged in as {auth().currentUser?.email}</Text>
          <Text style={{ fontSize: 11, color: colors.subtext, marginTop: 10, letterSpacing: 2 }}>VERSION 1.0.42</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
