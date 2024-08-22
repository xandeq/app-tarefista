import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface CustomJwtPayload extends JwtPayload {
  userId: string; // Adicione aqui outras propriedades personalizadas que você espera no payload
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        console.log(decoded);
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.userId, token });
        } else {
          await AsyncStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };
    loadUserFromStorage();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('authToken', data.token);
        const decodedToken: any = jwtDecode(data.token);
        setUser({ id: decodedToken.userId, token: data.token });
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  };

  if (loading) {
    return null; // ou um indicador de carregamento
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
