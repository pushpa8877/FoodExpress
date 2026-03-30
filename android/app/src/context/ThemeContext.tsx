import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    text: string;
    subtext: string;
    card: string;
    border: string;
    primary: string;
    secondary: string;
  };
}

const lightColors = {
  background: '#FFFFFF',
  text: '#1C1C1E',
  subtext: '#8E8E93',
  card: '#F8F9FB',
  border: '#F2F2F7',
  primary: '#4338CA',
  secondary: '#F2F2F7',
};

const darkColors = {
  background: '#000000',
  text: '#FFFFFF',
  subtext: '#ABA9AC',
  card: '#1C1C1E',
  border: '#2C2C2E',
  primary: '#6366F1',
  secondary: '#1C1C1E',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
