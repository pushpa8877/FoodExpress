import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useCart } from '../context/CartContext';

const CartScreen = ({ navigation }: any) => {
  const { cart, updateQuantity, removeFromCart, totalPrice } = useCart();

  const renderCartItem = ({ item }: any) => (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F2F2F7',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 2,
    }}>
      <Image 
        source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000' }} 
        style={{ width: 90, height: 90, borderRadius: 18 }} 
      />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontSize: 17, fontWeight: '900', color: '#1C1C1E' }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ fontSize: 13, color: '#8E8E93', marginTop: 4, fontWeight: '600' }}>{item.category}</Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }}>₹{item.price * item.quantity}</Text>
            
            <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: '#F2F2F7', 
                borderRadius: 12, 
                padding: 4 
            }}>
              <TouchableOpacity 
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                style={{ width: 32, height: 32, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' }}>-</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 15, fontSize: 15, fontWeight: '800', color: '#1C1C1E' }}>{item.quantity}</Text>
              <TouchableOpacity 
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ width: 32, height: 32, backgroundColor: '#4338CA', borderRadius: 10, justifyContent: 'center', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>+</Text>
              </TouchableOpacity>
            </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>🔙</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>My Basket</Text>
            <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '600' }}>Review your selections</Text>
          </View>
        </View>
        <TouchableOpacity 
           onPress={() => cart.length > 0 && Alert.alert("Clear Basket", "Are you sure you want to remove all items?", [{text: "Cancel"}, {text: "Clear", onPress: () => clearCart()}])}
           style={{ padding: 10 }}
        >
           <Text style={{ fontSize: 20 }}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <View style={{ width: 120, height: 120, backgroundColor: '#F5F3FF', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
             <Text style={{ fontSize: 60 }}>🛒</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E', textAlign: 'center' }}>Your basket is empty</Text>
          <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginTop: 10, fontWeight: '500', lineHeight: 22 }}>Explore the best kitchens in your vicinity and add items to get started.</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Home')}
            style={{ backgroundColor: '#4338CA', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, marginTop: 40, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 5 }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.5 }}>Browse Kitchens</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 150 }}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            backgroundColor: '#fff', 
            borderTopLeftRadius: 40, 
            borderTopRightRadius: 40, 
            paddingHorizontal: 32, 
            paddingTop: 32, 
            paddingBottom: Platform.OS === 'ios' ? 45 : 30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -20 },
            shadowOpacity: 0.05,
            shadowRadius: 30,
            elevation: 20,
            borderWidth: 1,
            borderColor: '#F2F2F7'
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, alignItems: 'flex-end' }}>
               <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bill Total</Text>
                  <Text style={{ fontSize: 32, fontWeight: '900', color: '#1C1C1E', marginTop: 4 }}>₹{totalPrice}</Text>
               </View>
               <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 12, color: '#059669', fontWeight: '800' }}>Incl. All Taxes & Fees</Text>
                  <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 2, fontWeight: '500' }}>Free Delivery Applied 🎁</Text>
               </View>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Order', { items: cart, total: totalPrice })}
              activeOpacity={0.8}
              style={{ backgroundColor: '#4338CA', paddingVertical: 20, borderRadius: 22, alignItems: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>PROCEED TO CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
