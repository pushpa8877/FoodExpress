import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const RestaurantScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribeRest = firestore()
      .collection('restaurants')
      .where('ownerId', '==', user.uid)
      .limit(1)
      .onSnapshot(querySnapshot => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setRestaurantData({ id: doc.id, ...doc.data() });
        } else {
          setRestaurantData(null);
        }
        setLoading(false);
      });

    return () => unsubscribeRest();
  }, [user]);

  useEffect(() => {
    if (!restaurantData?.id) return;

    const unsubscribeOrders = firestore()
      .collection('orders')
      .where('restaurantId', '==', restaurantData.id)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const orderList: any[] = [];
        querySnapshot.forEach(doc => {
          orderList.push({ id: doc.id, ...doc.data() });
        });
        setOrders(orderList);
      }, err => {
        console.error(err);
      });

    return () => unsubscribeOrders();
  }, [restaurantData]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await firestore().collection('orders').doc(orderId).update({
        status: newStatus
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const renderOrder = ({ item }: any) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
      </View>
      
      {item.items.map((food: any, index: number) => (
        <Text key={index} style={styles.foodItem}>{food.quantity}x {food.name}</Text>
      ))}

      <View style={styles.divider} />
      
      <View style={styles.actionRow}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity 
              onPress={() => updateOrderStatus(item.id, 'rejected')} 
              style={[styles.actionBtn, { borderColor: '#FF3B30' }]}
            >
              <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => updateOrderStatus(item.id, 'accepted')} 
              style={[styles.actionBtn, { backgroundColor: '#34C759', borderColor: '#34C759' }]}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
        {item.status === 'accepted' && (
          <TouchableOpacity 
            onPress={() => updateOrderStatus(item.id, 'preparing')} 
            style={[styles.actionBtn, { backgroundColor: '#6200EE', borderColor: '#6200EE', width: '100%' }]}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Start Preparing</Text>
          </TouchableOpacity>
        )}
        {item.status === 'preparing' && (
          <TouchableOpacity 
            onPress={() => updateOrderStatus(item.id, 'delivered')} 
            style={[styles.actionBtn, { backgroundColor: '#34C759', borderColor: '#34C759', width: '100%' }]}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Mark Delivered</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'accepted': return '#34C759';
      case 'preparing': return '#5856D6';
      case 'delivered': return '#8E8E93';
      case 'rejected': return '#FF3B30';
      default: return '#6200EE';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </SafeAreaView>
    );
  }

  if (!restaurantData) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ fontSize: 18, color: '#6C727A' }}>No restaurant found for this account.</Text>
      </SafeAreaView>
    );
  }

  if (restaurantData.status === 'pending') {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ fontSize: 40 }}>⏳</Text>
        <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 20 }}>Waiting for approval</Text>
        <Text style={{ textAlign: 'center', margin: 20, color: '#6C727A' }}>Your restaurant request is being reviewed by the admin.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{restaurantData.name}</Text>
          <Text style={styles.headerSub}>{orders.length} Total Orders</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileBtn}
        >
          <Text style={{ fontSize: 20 }}>👤</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={{ fontSize: 18, color: '#6C727A' }}>No orders yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1C1E',
  },
  headerSub: {
    fontSize: 14,
    color: '#6C727A',
  },
  profileBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  foodItem: {
    fontSize: 15,
    color: '#4A4C50',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F5',
    marginVertical: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});

export default RestaurantScreen;

