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
  ScrollView,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const SignUpScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword || !phoneNumber || !address) {
      Alert.alert('Error', 'Every detail counts. Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords must match to secure your account.');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // 🔥 Store comprehensive profile in Firestore
      await firestore().collection('users').doc(user.uid).set({
        name,
        email,
        phone: phoneNumber,
        address,
        role: "user",
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastActive: firestore.FieldValue.serverTimestamp()
      });

      Alert.alert('Welcome to FoodExpress!', 'Your account is ready. Let\'s get you some food.', [
        { text: 'Start Dining', onPress: () => navigation.navigate('Login') },
      ]);

    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', secureTextEntry = false, multiline = false }: any) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#8E8E93', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#C7C7CC"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: Platform.OS === 'ios' ? 16 : 12,
          fontSize: 16,
          color: '#1C1C1E',
          borderWidth: 1,
          borderColor: '#EFEFF4',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.03,
          shadowRadius: 10,
          elevation: 1,
          textAlignVertical: multiline ? 'top' : 'center',
          minHeight: multiline ? 80 : undefined
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 34, fontWeight: '900', color: '#1C1C1E', letterSpacing: -1 }}>Create Account</Text>
            <Text style={{ fontSize: 17, color: '#8E8E93', marginTop: 8, fontWeight: '500' }}>Join the community of fine diners.</Text>
          </View>

          <InputField label="Full Name" placeholder="Alex Johnson" value={name} onChangeText={setName} />
          <InputField label="Email Address" placeholder="alex@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField label="Phone Number" placeholder="9876543210" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
          <InputField label="Primary Delivery Address" placeholder="Street, City, Pincode" value={address} onChangeText={setAddress} multiline={true} />
          <InputField label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry={true} />
          <InputField label="Confirm Password" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignup}
            disabled={loading}
            style={{
              backgroundColor: '#4338CA',
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: 'center',
              marginTop: 10,
              shadowColor: '#4338CA',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 }}>Register Account</Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 30 }}>
            <Text style={{ color: '#8E8E93', fontSize: 15, fontWeight: '500' }}>Member already? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={{ color: '#4338CA', fontSize: 15, fontWeight: '800' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;