import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Define the context
const AuthContext = createContext<AuthContextType | null>(null);

// Define the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if the user is already logged in (using AsyncStorage)
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Make API call to log the user in
      const response = await fetch('https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save the user data to state and AsyncStorage
        setUser(data.user);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('authToken', data.token);
      } else {
        throw new Error(data.message || 'Failed to log in');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear user data from state and AsyncStorage
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
