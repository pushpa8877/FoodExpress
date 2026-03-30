import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const categories = ['Service', 'Food Quality', 'Delivery', 'Portion', 'Overall'];

const FeedbackScreen = ({ navigation }: any) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('Overall');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Incomplete Registry', 'Please select a star rating to proceed.');
      return;
    }

    setLoading(true);
    try {
      const user = auth().currentUser;
      await firestore().collection('feedbacks').add({
        userId: user?.uid || 'anonymous',
        userName: user?.displayName || 'Anonymous Diner',
        rating,
        category,
        comment,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Transmission Error', 'We couldn\'t save your feedback. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          style={{ padding: 8 }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 50, color: rating >= star ? '#FFD700' : '#F2F2F7' }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
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
        backgroundColor: '#fff', 
        borderBottomWidth: 1, 
        borderBottomColor: '#F2F2F7',
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ width: 45, height: 45, borderRadius: 15, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C1C1E' }}>Experience Review</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 }}>How was your experience?</Text>
          <Text style={{ fontSize: 14, color: '#8E8E93', fontWeight: '500', textAlign: 'center' }}>Your feedback helps us curate a better culinary experience for everyone.</Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 30, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOpacity: 0.02, elevation: 2 }}>
          {renderStars()}
          <Text style={{ textAlign: 'center', color: '#4338CA', fontSize: 16, marginBottom: 35, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Great' : rating === 5 ? 'Excellent' : 'Rate Us'}
          </Text>

          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1C1E', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Subject Area</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  backgroundColor: category === cat ? '#EEF2FF' : '#F8F9FB',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginRight: 8,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: category === cat ? '#4338CA' : '#EFEFF4',
                }}
              >
                <Text style={{ color: category === cat ? '#4338CA' : '#8E8E93', fontSize: 13, fontWeight: '800' }}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 14, fontWeight: '800', color: '#1C1C1E', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Narrative Feedback</Text>
          <TextInput
            placeholder="Tell us what you loved or what we can improve..."
            value={comment}
            onChangeText={setComment}
            placeholderTextColor="#C7C7CC"
            style={{ 
               backgroundColor: '#F8F9FB', 
               borderRadius: 20, 
               padding: 20, 
               fontSize: 16, 
               color: '#1C1C1E', 
               height: 150, 
               borderWidth: 1, 
               borderColor: '#EFEFF4',
               textAlignVertical: 'top',
               fontWeight: '500'
            }}
            multiline
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || rating === 0}
          style={{
            backgroundColor: (rating === 0 || loading) ? '#E5E5EA' : '#4338CA',
            borderRadius: 22,
            paddingVertical: 20,
            alignItems: 'center',
            marginTop: 40,
            shadowColor: '#4338CA',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: (rating === 0 || loading) ? 0 : 0.3,
            shadowRadius: 20,
            elevation: (rating === 0 || loading) ? 0 : 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>SUBMIT TO REGISTRY</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(28,28,30,0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 40, padding: 40, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 50 }}>
            <View style={{ width: 80, height: 80, borderRadius: 30, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
              <Text style={{ fontSize: 40 }}>✅</Text>
            </View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#1C1C1E', marginBottom: 10 }}>Thank You!</Text>
            <Text style={{ fontSize: 16, color: '#8E8E93', textAlign: 'center', marginBottom: 35, fontWeight: '500', lineHeight: 22 }}>Your feedback has been recorded in the FoodExpress ecosystem.</Text>
            <TouchableOpacity 
              style={{ backgroundColor: '#1C1C1E', paddingVertical: 18, borderRadius: 20, width: '100%', alignItems: 'center' }}
              onPress={() => { setShowSuccess(false); navigation.navigate('Home'); }}
            >
              <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>Confirm & Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FeedbackScreen;
