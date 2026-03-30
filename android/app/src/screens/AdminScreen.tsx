import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const AdminScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('restaurants')
      .where('status', '==', 'pending')
      .onSnapshot(querySnapshot => {
        const list: any[] = [];
        querySnapshot.forEach(doc => {
          list.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setRestaurants(list);
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await firestore().collection('restaurants').doc(id).update({
        status: 'approved',
      });
      Alert.alert('Success', 'Restaurant approved!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to approve');
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={{
      backgroundColor: '#F8F9FB',
      padding: 20,
      borderRadius: 15,
      marginBottom: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A1C1E' }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: '#6C727A', marginTop: 4 }}>Owner ID: {item.ownerId}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleApprove(item.id)}
        style={{
          backgroundColor: '#4CAF50',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 10
        }}
      >
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Approve</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 20 }}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '800' }}>Admin Dashboard</Text>
      </View>

      <View style={{ flex: 1, padding: 20 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200EE" />
        ) : (
          <FlatList
            data={restaurants}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 50, color: '#6C727A' }}>No pending requests</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminScreen;
