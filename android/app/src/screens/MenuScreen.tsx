import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const MenuScreen = ({ route, navigation }: any) => {
  const { restaurantId, restaurantName } = route.params;
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('menus')
      .where('restaurantId', '==', restaurantId)
      .onSnapshot(querySnapshot => {
        const items: any[] = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [restaurantId]);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category?.charAt(0).toUpperCase() + item.category?.slice(1))))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category?.toLowerCase() === selectedCategory.toLowerCase());

  const renderMenuItem = ({ item }: any) => (
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
        <Text style={{ fontSize: 13, color: '#8E8E93', marginTop: 4, fontWeight: '500' }}>{item.category}</Text>
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
        onPress={() => addToCart(item, restaurantId)}
        activeOpacity={0.8}
        style={{
          width: 44,
          height: 44,
          backgroundColor: '#4338CA',
          borderRadius: 15,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#4338CA',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4
        }}
      >
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
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
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }} numberOfLines={1}>{restaurantName}</Text>
            <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '600' }}>Explore our culinary assets</Text>
          </View>
        </View>
        <TouchableOpacity style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' }}>
           <Text style={{ fontSize: 18 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Category Quick Filter */}
      <View style={{ paddingVertical: 15 }}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginRight: 10,
                  backgroundColor: selectedCategory === cat ? '#4338CA' : '#F2F2F7',
                  borderWidth: 1,
                  borderColor: selectedCategory === cat ? '#4338CA' : '#EFEFF4'
                }}
              >
                <Text style={{ color: selectedCategory === cat ? '#fff' : '#8E8E93', fontWeight: '800', fontSize: 13 }}>{cat}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color="#4338CA" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ flex: 1, alignItems: 'center', marginTop: 80 }}>
              <Text style={{ fontSize: 40 }}>🍳</Text>
              <Text style={{ fontSize: 17, color: '#8E8E93', fontWeight: '700', marginTop: 15 }}>Our kitchen is preparing more delights</Text>
            </View>
          )}
        />
      )}

      {/* Cart Summary Bar */}
      {cart.length > 0 && (
        <View style={{ 
          position: 'absolute', 
          bottom: 30, 
          left: 24, 
          right: 24, 
          backgroundColor: '#1C1C1E', 
          height: 75, 
          borderRadius: 24, 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingHorizontal: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10
        }}>
          <View>
             <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>{cart.length} ITEMS ADDED</Text>
             <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</Text>
          </View>
          <TouchableOpacity 
             onPress={() => navigation.navigate('Cart')}
             style={{ backgroundColor: '#4338CA', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 }}
          >
             <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Checkout 🛒</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default MenuScreen;
