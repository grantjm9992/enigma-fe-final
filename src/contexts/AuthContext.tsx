import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginDto } from '../types/api';
import { authApi } from '../services/api';
import { tokenManager } from '../services/tokenManager';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenManager.getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to normalize user object (map 'id' to '_id')
  const normalizeUser = (userData: any): User => {
    return {
      ...userData,
      _id: userData.id || userData._id,
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authApi.getProfile();
          const normalizedUser = normalizeUser(response.data);
          setUser(normalizedUser);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          tokenManager.clearToken();
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (credentials: LoginDto) => {
    const response = await authApi.login(credentials);
    const { accessToken, user: userData } = response.data;

    const normalizedUser = normalizeUser(userData);

    tokenManager.setToken(accessToken);
    setToken(accessToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    tokenManager.clearToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
