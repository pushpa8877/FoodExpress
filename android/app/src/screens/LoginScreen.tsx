import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Incomplete Credentials', 'Please provide both email and password to access your hub.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      const doc = await firestore().collection('users').doc(user.uid).get();

      if (!doc.exists) {
        Alert.alert("Registry Error", "User profile not found in our records.");
        return;
      }

      const role = doc.data()?.role;
      const currentLocation = doc.data()?.location;

      if (!currentLocation) {
        // Mocking location selection - in a real app, this would use a Geolocation API
        Alert.alert(
          'Location Access',
          'Enable location to find the best kitchens near you.',
          [
            {
              text: 'Not Now',
              onPress: () => {
                navigation.replace(role === "admin" ? "Admin" : role === "restaurant" ? "Restaurant" : "Home");
              }
            },
            {
              text: 'Enable',
              onPress: async () => {
                await firestore().collection('users').doc(user.uid).update({
                  location: 'Sector 62, Noida' // Default mock location
                });
                navigation.replace(role === "admin" ? "Admin" : role === "restaurant" ? "Restaurant" : "Home");
              }
            }
          ]
        );
      } else {
        if (role === "admin") {
          navigation.replace("Admin");
        } else if (role === "restaurant") {
          navigation.replace("Restaurant");
        } else {
          navigation.replace("Home");
        }
      }

    } catch (error: any) {
      let errorMessage = 'Security verify failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'This email is not registered with us.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'The password you entered is incorrect.';
      }
      Alert.alert('Identity Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <View style={{ marginBottom: 60, alignItems: 'center' }}>
          <View style={{ width: 80, height: 80, backgroundColor: '#4338CA', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
            <Text style={{ fontSize: 40 }}>🍔</Text>
          </View>
          <Text style={{ fontSize: 34, fontWeight: '900', color: '#1C1C1E', letterSpacing: -1 }}>Welcome Back</Text>
          <Text style={{ fontSize: 16, color: '#8E8E93', marginTop: 10, fontWeight: '500' }}>Manage your orders with precision.</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#8E8E93', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Identifer (Email)</Text>
            <TextInput
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              style={{
                backgroundColor: '#F8F9FB',
                borderRadius: 18,
                paddingHorizontal: 20,
                paddingVertical: 18,
                fontSize: 16,
                color: '#1C1C1E',
                borderWidth: 1,
                borderColor: '#EFEFF4'
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#8E8E93', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Security Access</Text>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                backgroundColor: '#F8F9FB',
                borderRadius: 18,
                paddingHorizontal: 20,
                paddingVertical: 18,
                fontSize: 16,
                color: '#1C1C1E',
                borderWidth: 1,
                borderColor: '#EFEFF4'
              }}
              placeholderTextColor="#C7C7CC"
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor: '#4338CA',
              borderRadius: 20,
              paddingVertical: 20,
              alignItems: 'center',
              shadowColor: '#4338CA',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>Secure Entry</Text>
            )}
          </TouchableOpacity>   

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 35 }}>
            <Text style={{ color: '#8E8E93', fontSize: 15, fontWeight: '500' }}>New to Express? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={{ color: '#4338CA', fontSize: 15, fontWeight: '800' }}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;