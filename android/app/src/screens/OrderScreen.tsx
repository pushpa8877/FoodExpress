import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useCart } from '../context/CartContext';

const OrderScreen = ({ navigation }: any) => {
  const { cart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState('Fetching address...');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const user = auth().currentUser;

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserAddress(userDoc.data()?.address || 'Set your address in profile');
        }
      }
    };
    fetchUserAddress();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Session Expired', 'Please sign in to confirm your order.');
      navigation.navigate('Login');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Basket', 'Your basket is currently empty.');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        userName: user.displayName || 'Guest',
        userEmail: user.email,
        restaurantId: cart[0].restaurantId,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        totalPrice: totalPrice,
        status: 'pending',
        paymentMethod: paymentMethod,
        deliveryAddress: userAddress,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      const orderRef = await firestore().collection('orders').add(orderData);
      
      clearCart();
      Alert.alert('Order Placed! 🥳', 'Your feast is being prepared. Track it in real-time.', [
        { text: 'Track Order', onPress: () => navigation.replace('Tracking', { orderId: orderRef.id }) }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Dispatch Error', 'We couldn\'t process your order right now. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🔙</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>Secure Checkout</Text>
          <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '600' }}>Confirm your final details</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={{ marginBottom: 35 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
               <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }}>Delivery Address</Text>
               <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                  <Text style={{ color: '#4338CA', fontWeight: '700', fontSize: 13 }}>Change</Text>
               </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: '#F8F9FB', p: 20, borderRadius: 24, padding: 20, borderStyle: 'dashed', borderWidth: 1, borderColor: '#C7C7CC' }}>
               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>📍</Text>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1C1E' }}>Current Location</Text>
               </View>
               <Text style={{ fontSize: 14, color: '#8E8E93', lineHeight: 22, fontWeight: '500' }}>{userAddress}</Text>
            </View>
        </View>

        {/* Order Summary */}
        <View style={{ marginBottom: 35 }}>
           <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E', marginBottom: 15 }}>Order Summary</Text>
           <View style={{ backgroundColor: '#fff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOpacity: 0.02, elevation: 1 }}>
              {cart.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Text style={{ fontSize: 15, color: '#4A4C50', fontWeight: '600' }}>{item.quantity}x {item.name}</Text>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#1C1C1E' }}>₹{item.price * item.quantity}</Text>
                </View>
              ))}
              <View style={{ height: 1, backgroundColor: '#F2F2F7', marginVertical: 15 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }}>Grand Total</Text>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#4338CA' }}>₹{totalPrice}</Text>
              </View>
           </View>
        </View>

        {/* Payment Method */}
        <View style={{ marginBottom: 35 }}>
           <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E', marginBottom: 15 }}>Payment Method</Text>
           <TouchableOpacity 
             activeOpacity={0.9}
             onPress={() => setPaymentMethod('COD')}
             style={{ 
               flexDirection: 'row', 
               alignItems: 'center', 
               backgroundColor: paymentMethod === 'COD' ? '#EEF2FF' : '#fff', 
               padding: 20, 
               borderRadius: 24, 
               borderWidth: 2, 
               borderColor: paymentMethod === 'COD' ? '#4338CA' : '#F2F2F7' 
             }}
           >
              <View style={{ width: 45, height: 45, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 }}>
                 <Text style={{ fontSize: 24 }}>💵</Text>
              </View>
              <View style={{ flex: 1 }}>
                 <Text style={{ fontSize: 16, fontWeight: '800', color: '#1C1C1E' }}>Cash on Delivery</Text>
                 <Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '600', marginTop: 2 }}>Pay when your food arrives</Text>
              </View>
              <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#4338CA', justifyContent: 'center', alignItems: 'center' }}>
                 <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#4338CA' }} />
              </View>
           </TouchableOpacity>
        </View>

        {/* Place Order Button */}
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#1C1C1E',
            borderRadius: 22,
            paddingVertical: 22,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 8,
            marginTop: 10
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>PLACE ORDER NOW 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderScreen;
