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

const AddressScreen = ({ navigation }: any) => {
  const { colors, isDark } = useTheme();
  const user = auth().currentUser;
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ 
    title: '', 
    address: '',
    houseNo: '',
    floor: '',
    tower: '',
    landmark: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('addresses')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAddresses(list);
        setLoading(false);
      }, error => {
        console.error(error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const handleAddAddress = async () => {
    if (!newAddress.title || !newAddress.address || !newAddress.houseNo) {
      Alert.alert('Error', 'Please fill in required fields (Label, Address, House No)');
      return;
    }

    setSubmitting(true);
    try {
      await firestore()
        .collection('users')
        .doc(user?.uid)
        .collection('addresses')
        .add({
          title: newAddress.title,
          address: newAddress.address,
          houseNo: newAddress.houseNo,
          floor: newAddress.floor,
          tower: newAddress.tower,
          landmark: newAddress.landmark,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      
      // Update primary address in user doc if it's the first one
      if (addresses.length === 0) {
        await firestore().collection('users').doc(user?.uid).update({
          address: newAddress.address
        });
      }

      setNewAddress({ title: '', address: '', houseNo: '', floor: '', tower: '', landmark: '' });
      setShowAddForm(false);
      Alert.alert('Success', 'Address added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore()
              .collection('users')
              .doc(user?.uid)
              .collection('addresses')
              .doc(id)
              .delete();
          } catch {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
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
        <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>Address Directory</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {!showAddForm ? (
          <TouchableOpacity 
            onPress={() => setShowAddForm(true)}
            style={{
              backgroundColor: colors.primary,
              padding: 20,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
              marginTop: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', marginRight: 8 }}>+ Add New Address</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 24, 
            borderRadius: 24, 
            marginBottom: 30,
            borderWidth: 1,
            borderColor: colors.border
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 20 }}>New Address</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Label (e.g. Home, Office)</Text>
              <TextInput 
                value={newAddress.title}
                onChangeText={(text) => setNewAddress({...newAddress, title: text})}
                placeholder="Home"
                placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 16,
                  padding: 16,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              />
            </View>
            
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>House / Flat No.*</Text>
                <TextInput 
                  value={newAddress.houseNo}
                  onChangeText={(text) => setNewAddress({...newAddress, houseNo: text})}
                  placeholder="A-101"
                  placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 16,
                    padding: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Floor (Optional)</Text>
                <TextInput 
                  value={newAddress.floor}
                  onChangeText={(text) => setNewAddress({...newAddress, floor: text})}
                  placeholder="1st"
                  placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 16,
                    padding: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Tower (Optional)</Text>
                <TextInput 
                  value={newAddress.tower}
                  onChangeText={(text) => setNewAddress({...newAddress, tower: text})}
                  placeholder="Tower B"
                  placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 16,
                    padding: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Landmark</Text>
                <TextInput 
                  value={newAddress.landmark}
                  onChangeText={(text) => setNewAddress({...newAddress, landmark: text})}
                  placeholder="Near Park"
                  placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 16,
                    padding: 16,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.subtext, marginBottom: 8, textTransform: 'uppercase' }}>Full Address</Text>
              <TextInput 
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({...newAddress, address: text})}
                placeholder="Street name, Building, Pincode"
                placeholderTextColor={isDark ? '#555' : '#C7C7CC'}
                multiline
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 16,
                  padding: 16,
                  color: colors.text,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              />
            </View>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={() => setShowAddForm(false)}
                style={{ flex: 1, padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: colors.subtext, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleAddAddress}
                disabled={submitting}
                style={{ flex: 2, backgroundColor: colors.primary, padding: 16, borderRadius: 16, alignItems: 'center' }}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Save Address</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 50 }} />
        ) : addresses.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Text style={{ fontSize: 50, marginBottom: 20 }}>📍</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>No Addresses Found</Text>
            <Text style={{ fontSize: 14, color: colors.subtext, marginTop: 8, textAlign: 'center' }}>Add your delivery points for a faster checkout experience.</Text>
          </View>
        ) : (
          addresses.map((item) => (
            <View 
              key={item.id}
              style={{
                backgroundColor: colors.card,
                padding: 20,
                borderRadius: 24,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border
              }}
            >
              <View style={{ 
                width: 48, height: 48, borderRadius: 16, backgroundColor: colors.background, 
                justifyContent: 'center', alignItems: 'center', marginRight: 16 
              }}>
                <Text style={{ fontSize: 20 }}>{item.title.toLowerCase().includes('home') ? '🏠' : item.title.toLowerCase().includes('office') ? '💼' : '📍'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>{item.title}</Text>
                <Text style={{ fontSize: 13, color: colors.subtext, marginTop: 4 }}>
                  {item.houseNo}{item.floor ? `, Floor ${item.floor}` : ''}{item.tower ? `, ${item.tower}` : ''}
                </Text>
                <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 2 }}>{item.address}</Text>
                {item.landmark ? <Text style={{ fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '600' }}>📍 {item.landmark}</Text> : null}
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteAddress(item.id)}
                style={{ padding: 10 }}
              >
                <Text style={{ fontSize: 18, color: '#DC2626' }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddressScreen;
