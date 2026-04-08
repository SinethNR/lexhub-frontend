import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../utils/api';

export type UserRole = 'admin' | 'user' | 'lawyer' | null;

interface UserContextType {
  isLoggedIn: boolean;
  role: UserRole;
  user?: any;
  setRole: (role: UserRole) => void;
  perspective: UserRole;
  setPerspective: (perspective: UserRole) => void;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
  updateUser: (updates: Partial<any>) => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole>(null);
  const [perspective, setInternalPerspective] = useState<UserRole>(localStorage.getItem('lexhub_perspective') as UserRole || null);
  const [user, setUser] = useState<any>(null);

  const setPerspective = (p: UserRole) => {
    setInternalPerspective(p);
    if (p) localStorage.setItem('lexhub_perspective', p);
    else localStorage.removeItem('lexhub_perspective');
  };

  const fetchProfile = async () => {
    try {
      const profile = await api.get('/users/current');
      setUser(profile);
      setRole(profile.user_type as UserRole);
      if (!perspective) {
        setPerspective(profile.user_type as UserRole);
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Only logout if it's an auth error
      if (localStorage.getItem('token')) {
        // localStorage.removeItem('token');
        // setIsLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, []);

  const login = (token: string, newRole: UserRole) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
    setRole(newRole);
    setPerspective(newRole);
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('lexhub_perspective');
    setIsLoggedIn(false);
    setRole(null);
    setPerspective(null);
    setUser(null);
  };

  const updateUser = async (updates: Partial<any>) => {
    try {
      if (user?.id) {
        await api.put(`/users/profile/${user.id}`, updates);
      }
      setUser((prev: any) => ({ ...prev, ...updates }));
    } catch (err) {
      console.error('Failed to update user profile', err);
    }
  };

  return (
    <UserContext.Provider value={{ isLoggedIn, role, setRole, perspective, setPerspective, login, logout, user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
