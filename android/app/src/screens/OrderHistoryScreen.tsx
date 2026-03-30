import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useCart } from '../context/CartContext';

const OrderHistoryScreen = ({ navigation }: any) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, clearCart } = useCart();
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;

    const unsubscribe = firestore()
      .collection('orders')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const orderList: any[] = [];
        querySnapshot.forEach(doc => {
          orderList.push({ id: doc.id, ...doc.data() });
        });
        setOrders(orderList);
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [user]);

  const handleReorder = (item: any) => {
    clearCart();
    item.items.forEach((food: any) => {
      // Re-adding items with their original restaurant ID
      addToCart(food, item.restaurantId);
    });
    navigation.navigate('Cart');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#FFF7ED', text: '#C2410C', label: 'Pending' };
      case 'accepted': return { bg: '#ECFDF5', text: '#047857', label: 'Accepted' };
      case 'preparing': return { bg: '#EEF2FF', text: '#4338CA', label: 'In Kitchen' };
      case 'delivered': return { bg: '#F9FAFB', text: '#6B7280', label: 'Delivered' };
      default: return { bg: '#F3F4F6', text: '#1F2937', label: status };
    }
  };

  const renderOrderItem = ({ item }: any) => {
    const status = getStatusStyle(item.status);
    return (
      <View 
        style={{
          backgroundColor: '#fff',
          borderRadius: 28,
          padding: 24,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#F2F2F7'
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={{ fontSize: 13, color: '#C7C7CC', marginTop: 2, fontWeight: '500' }}>
               {item.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={{ backgroundColor: status.bg, px: 12, py: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
            <Text style={{ color: status.text, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{status.label}</Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#F2F2F7', marginBottom: 15 }} />
        
        <View style={{ marginBottom: 15 }}>
          {item.items.map((food: any, index: number) => (
            <Text key={index} style={{ fontSize: 15, color: '#4A4C50', marginBottom: 6, fontWeight: '600' }}>
               <Text style={{ color: '#1C1C1E', fontWeight: '800' }}>{food.quantity}x</Text> {food.name}
            </Text>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
          <View>
             <Text style={{ fontSize: 11, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase' }}>Total Amount</Text>
             <Text style={{ fontSize: 20, fontWeight: '900', color: '#1C1C1E' }}>₹{item.totalPrice}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
             <TouchableOpacity 
                onPress={() => navigation.navigate('Tracking', { orderId: item.id })}
                style={{ backgroundColor: '#F2F2F7', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 }}
             >
                <Text style={{ color: '#1C1C1E', fontSize: 12, fontWeight: '800' }}>Details</Text>
             </TouchableOpacity>
             <TouchableOpacity 
                onPress={() => handleReorder(item)}
                style={{ backgroundColor: '#4338CA', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 }}
             >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Reorder</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 24, 
        paddingTop: Platform.OS === 'ios' ? 10 : 20, 
        paddingBottom: 20, 
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#F2F2F7',
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>Order Archives</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color="#4338CA" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
              <View style={{ width: 100, height: 100, backgroundColor: '#F2F2F7', borderRadius: 34, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                 <Text style={{ fontSize: 40 }}>📦</Text>
              </View>
              <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '800' }}>No past orders found</Text>
              <Text style={{ fontSize: 14, color: '#C7C7CC', marginTop: 8, fontWeight: '500' }}>Your culinary journey starts here.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;
