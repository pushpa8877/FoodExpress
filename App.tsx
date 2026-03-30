import 'react-native-gesture-handler';
import React from 'react';
import AppNavigator from './android/app/src/navigation/AppNavigator';
import { CartProvider } from './android/app/src/context/CartContext';
import { ThemeProvider } from './android/app/src/context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;