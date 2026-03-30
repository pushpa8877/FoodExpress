import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

const DashboardScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcome}>Feedback Overview</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>Thank you for your feedback! Your entries help us improve the mess experience.</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Text style={styles.buttonText}>Submit More Feedback</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1C1E',
  },
  content: {
    padding: 24,
  },
  welcome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A4C50',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 24,
  },
  cardText: {
    fontSize: 16,
    color: '#6C727A',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
