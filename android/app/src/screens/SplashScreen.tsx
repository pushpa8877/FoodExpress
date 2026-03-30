import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    // Check authentication state after a short delay for the branding
    const checkAuth = setTimeout(() => {
      const user = auth().currentUser;
      if (user) {
        // User is already logged in, go to Home
        navigation.replace('Home');
      } else {
        // No user, go to Login
        navigation.replace('Login');
      }
    }, 2500); // 2.5 seconds delay for splash visibility

    return () => clearTimeout(checkAuth);
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ alignItems: 'center' }}>
        {/* Premium Logo Design using Views and Emojis */}
        <View style={{ 
          width: 140, 
          height: 140, 
          backgroundColor: '#fff', 
          borderRadius: 70, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: 24,
          elevation: 15,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
        }}>
          {/* Inner ring for a more branded look */}
          <View style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 2,
            borderColor: '#F0EFFF',
            borderStyle: 'dashed',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text style={{ fontSize: 70 }}>🍱</Text>
          </View>
        </View>

        <Text style={{ fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 2, textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
          FoodExpress
        </Text>
        <View style={{ marginTop: 10, paddingHorizontal: 20, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 }}>
          <Text style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold', letterSpacing: 1 }}>FAST • FRESH • FAVORITE</Text>
        </View>
      </View>
      
      {/* Loading indicator at the bottom */}
      <View style={{ position: 'absolute', bottom: 60, alignItems: 'center' }}>
        <ActivityIndicator color="#fff" size="large" />
        <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12, fontSize: 12, fontWeight: '600' }}>Verifying your session...</Text>
      </View>
    </SafeAreaView>
  );
};

export default SplashScreen;
