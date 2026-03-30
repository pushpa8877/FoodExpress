import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

const DeliveryScreen = ({ navigation }: any) => {
  const [status, setStatus] = useState('Preparing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate order processing delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Simulate status update after more time
    const statusTimer = setTimeout(() => {
      setStatus('Delivered');
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(statusTimer);
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        
        {/* Success Icon */}
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: '#E8F5E9',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 30
        }}>
          <Text style={{ fontSize: 50, color: '#4CAF50' }}>✓</Text>
        </View>

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1A1C1E', marginBottom: 10, textAlign: 'center' }}>
          Order Placed Successfully!
        </Text>
        
        <Text style={{ fontSize: 16, color: '#6C727A', marginBottom: 40, textAlign: 'center' }}>
          Your delicious meal is on its way to your table.
        </Text>

        {/* Status Card */}
        <View style={{
          backgroundColor: '#fff',
          width: '100%',
          padding: 30,
          borderRadius: 24,
          alignItems: 'center',
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }}>
          <Text style={{ fontSize: 14, color: '#6C727A', marginBottom: 8, fontWeight: '600' }}>Current Status</Text>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: status === 'Delivered' ? '#4CAF50' : '#6200EE',
            marginBottom: 20 
          }}>
            {status}
          </Text>

          {status === 'Preparing' && (
            <ActivityIndicator color="#6200EE" size="large" />
          )}

          {status === 'Delivered' && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#6C727A', marginBottom: 20, textAlign: 'center' }}>
                Hope you enjoyed your food! Please let us know how it was.
              </Text>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Feedback')}
                style={{
                  backgroundColor: '#6200EE',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 40,
                  alignItems: 'center',
                  elevation: 2,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Give Feedback</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Home')}
          style={{ marginTop: 30 }}
        >
          <Text style={{ color: '#6200EE', fontWeight: 'bold', fontSize: 16 }}>Back to Home</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
