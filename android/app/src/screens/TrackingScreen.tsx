import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const TrackingScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('orders')
      .doc(orderId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setOrder({ id: doc.id, ...doc.data() });
        }
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [orderId]);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'accepted': return 2;
      case 'preparing': return 3;
      case 'delivered': return 4;
      default: return 1;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4338CA" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <Text style={{ fontSize: 40 }}>🤷‍♂️</Text>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E', marginTop: 20 }}>Order Not Found</Text>
        <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 10, fontWeight: '500' }}>We couldn't locate this specific order in our registry.</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: '#4338CA', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 30 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Return to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentStep = getStatusStep(order.status);
  const steps = [
    { step: 1, label: 'Placed', icon: '📝', desc: 'Order received' },
    { step: 2, label: 'Accepted', icon: '✅', desc: 'Kitchen confirmed' },
    { step: 3, label: 'Preparing', icon: '👨‍🍳', desc: 'Chef is cooking' },
    { step: 4, label: 'Delivered', icon: '😋', desc: 'Enjoy your meal' },
  ];

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
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>✕</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '900', color: '#1C1C1E' }}>Live Tracker</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#F2F2F7', alignItems: 'center', marginBottom: 35 }}>
           <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1 }}>ORDER #{order.id.slice(-6).toUpperCase()}</Text>
           <Text style={{ fontSize: 26, fontWeight: '900', color: '#1C1C1E', textAlign: 'center', marginTop: 15, lineHeight: 32 }}>
              {order.status === 'pending' && 'Waiting to be accepted...'}
              {order.status === 'accepted' && 'Order Accepted!'}
              {order.status === 'preparing' && 'Chef is at work...'}
              {order.status === 'delivered' && 'Delivered successfully!'}
           </Text>
           <View style={{ width: 60, height: 4, backgroundColor: '#4338CA', borderRadius: 2, marginTop: 20 }} />
        </View>

        {/* Stepper Vertical */}
        <View style={{ paddingLeft: 10 }}>
          {steps.map((item, index) => (
            <View key={item.step} style={{ flexDirection: 'row', height: 90 }}>
               <View style={{ alignItems: 'center', marginRight: 20 }}>
                  <View style={{ 
                     width: 44, height: 44, borderRadius: 15, 
                     backgroundColor: currentStep >= item.step ? '#4338CA' : '#F2F2F7', 
                     justifyContent: 'center', alignItems: 'center', zIndex: 2,
                     shadowColor: '#4338CA', shadowOpacity: currentStep === item.step ? 0.3 : 0, shadowRadius: 10, elevation: currentStep === item.step ? 5 : 0
                  }}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  {index !== steps.length - 1 && (
                    <View style={{ flex: 1, width: 2, backgroundColor: currentStep > item.step ? '#4338CA' : '#F2F2F7', zIndex: 1 }} />
                  )}
               </View>
               <View style={{ paddingTop: 4 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: currentStep >= item.step ? '#1C1C1E' : '#C7C7CC' }}>{item.label}</Text>
                  <Text style={{ fontSize: 14, color: currentStep >= item.step ? '#8E8E93' : '#E5E5EA', fontWeight: '500', marginTop: 2 }}>{item.desc}</Text>
               </View>
            </View>
          ))}
        </View>

        {/* Items Summary */}
        <View style={{ backgroundColor: '#F8F9FB', borderRadius: 28, padding: 25, marginTop: 20, borderWidth: 1, borderColor: '#EFEFF4' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#1C1C1E', marginBottom: 20 }}>Consumables Selected</Text>
          {order.items.map((item: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: '#4A4C50', fontWeight: '600' }}>{item.quantity}x {item.name}</Text>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1C1E' }}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: '#E5E5EA', marginVertical: 15, borderStyle: 'dashed' }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: '#1C1C1E' }}>Total Paid</Text>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#4338CA' }}>₹{order.totalPrice}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: '#F2F2F7', paddingVertical: 20, borderRadius: 20, alignItems: 'center', marginTop: 40 }}
        >
          <Text style={{ color: '#1C1C1E', fontWeight: '800', fontSize: 16 }}>Back to Home Screen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TrackingScreen;
