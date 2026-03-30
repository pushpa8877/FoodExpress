import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const EditProfileScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const user = auth().currentUser;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const doc = await firestore().collection('users').doc(user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          setProfile(data);
          setFormData({ name: data?.name || '', phone: data?.phone || '' });
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleUpdate = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      await firestore().collection('users').doc(user?.uid).update({
        name: formData.name,
        phone: formData.phone,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
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
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ 
            width: 100, height: 100, borderRadius: 35, backgroundColor: colors.primary, 
            justifyContent: 'center', alignItems: 'center', marginBottom: 16 
          }}>
            <Text style={{ fontSize: 45 }}>🍕</Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.subtext, fontWeight: '600' }}>{user?.email}</Text>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Full Name</Text>
          <TextInput 
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            placeholder="Your name"
            placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 18,
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              borderWidth: 1,
              borderColor: colors.border
            }}
          />
        </View>

        <View style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Phone Number</Text>
          <TextInput 
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            placeholder="000-000-0000"
            placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
            keyboardType="phone-pad"
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 18,
              color: colors.text,
              fontSize: 16,
              fontWeight: '600',
              borderWidth: 1,
              borderColor: colors.border
            }}
          />
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleUpdate}
          disabled={submitting}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 22,
            paddingVertical: 20,
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 8,
          }}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800' }}>Save Changes</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
