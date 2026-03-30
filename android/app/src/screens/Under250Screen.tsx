import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useCart } from '../context/CartContext';

const Under250Screen = ({ navigation }: any) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('menus')
      .where('price', '<', 250)
      .onSnapshot(querySnapshot => {
        const dishList: any[] = [];
        querySnapshot.forEach(doc => {
          dishList.push({ id: doc.id, ...doc.data() });
        });
        setItems(dishList);
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: any) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 24,
        marginHorizontal: 24,
        marginBottom: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F2F2F7'
      }}
    >
      <TouchableOpacity 
        onPress={() => navigation.navigate('FoodDetail', { item })}
        style={{ width: 100, height: 100, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F8F9FB' }}
      >
        <Image 
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000' }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </TouchableOpacity>

      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }} numberOfLines={1}>{item.name}</Text>
        <Text style={{ fontSize: 13, color: '#8E8E93', marginTop: 4, fontWeight: '500' }}>{item.restaurantName || 'Gourmet Kitchen'}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
           <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }}>₹{item.price}</Text>
           {item.isVeg !== undefined && (
             <View style={{ marginLeft: 10, width: 14, height: 14, borderWidth: 1, borderColor: item.isVeg ? '#059669' : '#DC2626', justifyContent: 'center', alignItems: 'center', borderRadius: 2 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.isVeg ? '#059669' : '#DC2626' }} />
             </View>
           )}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => addToCart(item, item.restaurantId)}
        activeOpacity={0.8}
        style={{
          width: 44,
          height: 44,
          backgroundColor: '#4338CA',
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      
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
          style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
        >
          <Text style={{ fontSize: 18, color: '#1C1C1E', fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>Under ₹250</Text>
          <Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '600' }}>Budget friendly delights</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color="#4338CA" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
              <Text style={{ fontSize: 50 }}>💸</Text>
              <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '700', marginTop: 15 }}>No items found under ₹250</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Under250Screen;
