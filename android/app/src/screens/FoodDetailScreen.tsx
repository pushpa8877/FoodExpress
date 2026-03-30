import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useCart } from '../context/CartContext';

const FoodDetailScreen = ({ route, navigation }: any) => {
  const { item } = route.params;
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, item.restaurantId || 'default');
    Alert.alert(
      'Cart Updated',
      `${item.name} is now in your basket. Ready to proceed?`,
      [
        { text: 'Keep Browsing', style: 'cancel' },
        { text: 'Go to Basket', onPress: () => navigation.navigate('Cart') }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={{ width: '100%', height: 400, position: 'relative' }}>
          <Image 
            source={{ uri: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000' }} 
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, backgroundColor: 'rgba(0,0,0,0.2)' }} />
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 50 : 20,
              left: 20,
              width: 44,
              height: 44,
              borderRadius: 15,
              backgroundColor: 'rgba(255,255,255,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Content Card */}
        <View style={{ 
          marginTop: -40,
          backgroundColor: '#fff', 
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          paddingHorizontal: 32,
          paddingTop: 40,
          minHeight: 500,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <View style={{ backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 12 }}>
                <Text style={{ fontSize: 11, color: '#4338CA', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>{item.category || 'Specialty'}</Text>
              </View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#1C1C1E', lineHeight: 38 }}>{item.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', paddingTop: 5 }}>
               <Text style={{ fontSize: 30, fontWeight: '900', color: '#4338CA' }}>₹{item.price}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
               <Text style={{ fontSize: 16, color: '#FFD700' }}>★</Text>
               <Text style={{ fontSize: 14, fontWeight: '800', marginLeft: 6, color: '#1C1C1E' }}>{item.rating || '4.8'}</Text>
               <Text style={{ fontSize: 13, color: '#8E8E93', marginLeft: 4, fontWeight: '500' }}>(150+ Reviews)</Text>
            </View>
            <View style={{ width: 1, height: 15, backgroundColor: '#E5E5EA', marginHorizontal: 15 }} />
            <Text style={{ fontSize: 14, color: '#059669', fontWeight: '800' }}>Available Now</Text>
          </View>
          
          <Text style={{ fontSize: 18, color: '#1C1C1E', fontWeight: '900', marginBottom: 12 }}>Chef's Narrative</Text>
          <Text style={{ fontSize: 16, color: '#8E8E93', lineHeight: 26, marginBottom: 35, fontWeight: '500' }}>
            Indulge in our signature {item.name}. This dish is a masterpiece of flavors, prepared fresh using authentic spices and premium ingredients sourced directly from organic farms. Every bite is a journey through culinary excellence.
          </Text>

          {/* Highlights */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            {[
               { icon: '⏱️', label: '25 min', sub: 'Prep Time' },
               { icon: '🔥', label: 'Freshly Baked', sub: 'Kitchen State' },
               { icon: '🛡️', label: 'Certified', sub: 'Hygiene' }
            ].map((h, i) => (
              <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 55, height: 55, borderRadius: 20, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#F2F2F7' }}>
                  <Text style={{ fontSize: 24 }}>{h.icon}</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#1C1C1E', fontWeight: '800' }}>{h.label}</Text>
                <Text style={{ fontSize: 11, color: '#C7C7CC', marginTop: 2, fontWeight: '600' }}>{h.sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 25, paddingTop: 20,
        backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: '#F2F2F7', backdropBlur: 20
      }}>
        <TouchableOpacity
          onPress={handleAddToCart}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#4338CA', borderRadius: 22, paddingVertical: 20, alignItems: 'center',
            shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>ADD TO BASKET 🛒</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FoodDetailScreen;
