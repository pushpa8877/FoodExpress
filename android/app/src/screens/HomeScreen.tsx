import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'All', icon: '🍽️' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Biryani', icon: '🥘' },
  { id: '4', name: 'Burgers', icon: '🍔' },
  { id: '5', name: 'Thali', icon: '🍱' },
  { id: '6', name: 'Dessert', icon: '🍰' },
];

const BANNERS = [
  { id: '1', title: '50% OFF', subtitle: 'On your first order', color: '#4338CA', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000' },
  { id: '2', title: 'Free Delivery', subtitle: 'From top-rated kitchens', color: '#059669', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000' },
];

const HomeScreen = ({ navigation }: any) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingItems, setFetchingItems] = useState(false);
  const [userName, setUserName] = useState('User');
  const [location, setLocation] = useState('Set Location');
  const [under250Items, setUnder250Items] = useState<any[]>([]);
  const { cart, addToCart } = useCart();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists()) {
          setUserName(userDoc.data()?.name?.split(' ')[0] || 'User');
          setLocation(userDoc.data()?.location || 'Set Location');
        }
      }
    };
    fetchUserData();

    const unsubscribe = firestore()
      .collection('restaurants')
      .where('isApproved', '==', true)
      .onSnapshot(querySnapshot => {
        const restaurantList: any[] = [];
        querySnapshot.forEach(doc => {
          restaurantList.push({ id: doc.id, ...doc.data() });
        });
        setRestaurants(restaurantList);
        setLoading(false);
      }, err => {
        console.error(err);
        setLoading(false);
      });


    const under250Unsubscribe = firestore()
      .collection('menus')
      .where('price', '<', 250)
      .limit(6)
      .onSnapshot(querySnapshot => {
        const items: any[] = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setUnder250Items(items);
      });

    return () => {
      unsubscribe();
      under250Unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setMenuItems([]);
      return;
    }

    setFetchingItems(true);
    const unsubscribe = firestore()
      .collection('menus')
      .where('category', '==', selectedCategory.toLowerCase())
      .onSnapshot(querySnapshot => {
        const items: any[] = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setMenuItems(items);
        setFetchingItems(false);
      }, err => {
        console.error(err);
        setFetchingItems(false);
      });

    return () => unsubscribe();
  }, [selectedCategory]);

  const filteredData = useMemo(() => {
    return selectedCategory === 'All' 
      ? restaurants.filter(res => res.name?.toLowerCase().includes(search.toLowerCase())) 
      : menuItems.filter(item => item.name?.toLowerCase().includes(search.toLowerCase()));
  }, [selectedCategory, restaurants, menuItems, search]);

  const renderHeader = useMemo(() => (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Banner Carousel (Hide when category is active for cleaner look) */}
      {selectedCategory === 'All' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 35, marginTop: 10 }}>
          {BANNERS.map(banner => (
            <TouchableOpacity 
              key={banner.id}
              activeOpacity={0.9}
              style={{ 
                width: width - 48, 
                height: 160, 
                backgroundColor: banner.color, 
                borderRadius: 30, 
                marginRight: 15, 
                overflow: 'hidden',
                flexDirection: 'row'
              }}
            >
              <View style={{ flex: 1.2, padding: 25, justifyContent: 'center' }}>
                 <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>{banner.title}</Text>
                 <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4, fontWeight: '600' }}>{banner.subtitle}</Text>
                 <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginTop: 15 }}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' }}>Available Now</Text>
                 </View>
              </View>
              <View style={{ flex: 1 }}>
                 <Image source={{ uri: banner.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Categories */}
      <View style={{ marginBottom: 35 }}>
         <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E', marginBottom: 15 }}>Pick a Category</Text>
         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.name)}
                style={{
                  backgroundColor: selectedCategory === cat.name ? '#4338CA' : '#FFFFFF',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 18,
                  marginRight: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: selectedCategory === cat.name ? '#4338CA' : '#EFEFF4',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  elevation: 2
                }}
              >
                <Text style={{ fontSize: 18, marginRight: 8 }}>{cat.icon}</Text>
                <Text style={{ color: selectedCategory === cat.name ? '#fff' : '#1C1C1E', fontWeight: '800', fontSize: 14 }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      {/* Under 250 Section */}
      {selectedCategory === 'All' && under250Items.length > 0 && (
        <View style={{ marginBottom: 35 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#1C1C1E' }}>Under ₹250</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Under250')}>
              <Text style={{ color: '#4338CA', fontWeight: '700', fontSize: 14 }}>Show All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {under250Items.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('FoodDetail', { item })}
                style={{
                  width: 160,
                  marginRight: 15,
                  backgroundColor: '#fff',
                  borderRadius: 20,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#F2F2F7',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 2
                }}
              >
                <Image 
                  source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000' }} 
                  style={{ width: '100%', height: 100, borderRadius: 15, marginBottom: 10 }}
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1C1E' }} numberOfLines={1}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>₹{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Kitchens Section Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
         <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>
           {selectedCategory === 'All' ? 'Featured Kitchens' : `Delicious ${selectedCategory}s`}
         </Text>
         {selectedCategory === 'All' && (
           <TouchableOpacity>
              <Text style={{ color: '#4338CA', fontWeight: '700', fontSize: 14 }}>View All</Text>
           </TouchableOpacity>
         )}
      </View>
    </View>
  ), [selectedCategory, under250Items, navigation]);

  const renderRestaurant = useCallback(({ item }: any) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Menu', { restaurantId: item.id, restaurantName: item.name })}
      activeOpacity={0.9}
      style={{
        backgroundColor: '#fff',
        borderRadius: 28,
        marginHorizontal: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F2F2F7'
      }}
    >
      <View style={{ width: '100%', height: 200 }}>
        <Image 
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42397?q=80&w=1000' }} 
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={{
          position: 'absolute',
          top: 20,
          left: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <Text style={{ color: '#FFD700', fontSize: 12 }}>★</Text>
          <Text style={{ color: '#1C1C1E', fontSize: 12, fontWeight: '900', marginLeft: 4 }}>{item.rating || '4.5'}</Text>
        </View>
      </View>

      <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#1C1C1E' }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
             <Text style={{ fontSize: 13, color: '#8E8E93', fontWeight: '600' }}>{item.category || 'Fine Dining'}</Text>
             <View style={{ width: 15, height: 1.5, backgroundColor: '#C7C7CC', marginHorizontal: 8 }} />
             <Text style={{ fontSize: 13, color: '#059669', fontWeight: '700' }}>20-30 min</Text>
          </View>
          </View>
        <View style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F5F3FF', justifyContent: 'center', alignItems: 'center' }}>
           <Text style={{ fontSize: 18 }}>➡️</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderMenuItem = useCallback(({ item }: any) => (
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
  ), [addToCart, navigation]);

  const renderEmpty = useCallback(() => (
    <View style={{ flex: 1, alignItems: 'center', marginTop: 100 }}>
      <Text style={{ fontSize: 30 }}>🥘</Text>
      <Text style={{ fontSize: 18, color: '#8E8E93', fontWeight: '700', marginTop: 15 }}>
        {selectedCategory === 'All' ? 'No kitchens matched your search' : `We're preparing more ${selectedCategory}s`}
      </Text>
    </View>
  ), [selectedCategory]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />

      {/* Fixed Sticky Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 30 : 50, backgroundColor: '#fff', zIndex: 10 }}>
        {/* Welcome Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Address')}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}
            >
              <Text style={{ fontSize: 18, marginRight: 6 }}>📍</Text>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#1C1C1E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Deliver to</Text>
                  <Text style={{ fontSize: 10, color: '#4338CA', marginLeft: 4 }}>▼</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#8E8E93' }} numberOfLines={1}>{location}</Text>
              </View>
            </TouchableOpacity>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1C1C1E', marginTop: 5 }}>Hello, {userName}!</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            style={{ 
              width: 50, 
              height: 50, 
              borderRadius: 20, 
              backgroundColor: '#F2F2F7', 
              overflow: 'hidden', 
              borderWidth: 2, 
              borderColor: '#fff', 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 4 }, 
              shadowOpacity: 0.1, 
              shadowRadius: 10, 
              elevation: 4 
            }}
          >
            <Image source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=4338CA&color=fff` }} style={{ width: '100%', height: '100%' }} />
          </TouchableOpacity>
        </View>

        {/* Fixed Search Bar - Never Re-mounts */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: '#F2F2F7', 
          borderRadius: 20, 
          paddingHorizontal: 20, 
          height: 60,
          marginBottom: 10
        }}>
          <Text style={{ fontSize: 18 }}>🔍</Text>
          <TextInput 
            placeholder={selectedCategory === 'All' ? "Search for kitchens..." : `Search in ${selectedCategory}...`}
            value={search}
            onChangeText={setSearch}
            style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#1C1C1E' }}
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>
      
      {/* Dynamic Header Badge for Cart */}
      {cart.length > 0 && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cart')}
          style={{ 
            position: 'absolute', 
            bottom: 30, 
            right: 30, 
            backgroundColor: '#1C1C1E', 
            height: 65, 
            paddingHorizontal: 25, 
            borderRadius: 25, 
            flexDirection: 'row', 
            alignItems: 'center', 
            zIndex: 100,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10
          }}
        >
          <Text style={{ fontSize: 22, marginRight: 15 }}>🛒</Text>
          <View>
             <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>View Basket</Text>
             <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>{cart.length} Items • ₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</Text>
          </View>
        </TouchableOpacity>
      )}

      {(loading || fetchingItems) ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
           <ActivityIndicator size="large" color="#4338CA" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderHeader}
          data={filteredData}
          renderItem={selectedCategory === 'All' ? renderRestaurant : renderMenuItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;