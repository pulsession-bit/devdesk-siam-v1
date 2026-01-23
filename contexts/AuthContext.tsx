
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChanged, setMockMode, injectTestData, signInWithGoogle } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'client' | 'agent' | 'admin';
  loading: boolean;
  loginAsGuest: () => void;
  loginAsTester: () => void;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: 'client',
  loading: true,
  loginAsGuest: () => { },
  loginAsTester: () => { },
  loginWithGoogle: async () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'agent' | 'admin'>('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const backupTimeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    if (!auth) {
      setLoading(false);
      clearTimeout(backupTimeout);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setUserRole('client');
      setLoading(false);
      clearTimeout(backupTimeout);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(backupTimeout);
    };
  }, []);

  const loginAsGuest = () => {
    setMockMode(true);
    const guestUser: any = {
      uid: 'guest-' + Date.now(),
      displayName: 'Invité (Démo)',
      email: 'guest@demo.local',
      isAnonymous: true,
    };
    setUser(guestUser);
    setUserRole('client');
    setLoading(false);
  };

  const loginAsTester = () => {
    const tester = injectTestData();
    setUser(tester as any);
    setUserRole('client');
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result && result.user) {
        setUser(result.user as User);
        setUserRole('client');
      }
      setLoading(false);
    } catch (error) {
      console.error("Google Login Error:", error);
      setLoading(false);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, loginAsGuest, loginAsTester, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
