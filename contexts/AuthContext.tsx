import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  auth,
  onAuthStateChanged,
  setMockMode,
  injectTestData,
  signInWithGoogle,
  logout as firebaseLogout,
  getOrCreateSession,
  captureClientMetadata,
  db,
  isMockMode,
  setDoc,
  serverTimestamp,
  doc
} from '../services/firebase';

interface AuthContextType {
  user: User | null;
  userRole: 'client' | 'agent' | 'admin';
  loading: boolean;
  sessionId: string | null;
  isAuthenticated: boolean;
  loginAsGuest: () => void;
  loginAsTester: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: 'client',
  loading: true,
  sessionId: null,
  isAuthenticated: false,
  loginAsGuest: () => {},
  loginAsTester: () => {},
  loginWithGoogle: async () => {},
  logout: async () => {}
});

const USER_SESSION_KEY = 'siam_visa_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'client' | 'agent' | 'admin'>('client');
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(USER_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.user && parsed.timestamp) {
          // Check if session is less than 7 days old
          const isValid = Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000;
          if (isValid && parsed.user.uid) {
            setUser(parsed.user);
            setUserRole(parsed.userRole || 'client');
            setSessionId(parsed.sessionId);
          }
        }
      } catch (e) {
        console.error('Failed to restore session:', e);
        localStorage.removeItem(USER_SESSION_KEY);
      }
    }
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const backupTimeout = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    if (!auth || isMockMode) {
      setLoading(false);
      clearTimeout(backupTimeout);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserRole('client');

        // Create or get session in Firestore
        try {
          const newSessionId = await getOrCreateSession(currentUser);
          setSessionId(newSessionId);

          // Save user profile to Firestore
          await saveUserProfile(currentUser, newSessionId);

          // Persist to localStorage
          persistSession(currentUser, 'client', newSessionId);
        } catch (e) {
          console.error('Session creation error:', e);
        }
      } else {
        // Only clear if not in mock mode
        if (!isMockMode) {
          setUser(null);
          setSessionId(null);
          localStorage.removeItem(USER_SESSION_KEY);
        }
      }

      setLoading(false);
      clearTimeout(backupTimeout);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(backupTimeout);
    };
  }, []);

  // Save user profile to Firestore after login
  const saveUserProfile = async (user: User, sessionId: string | null) => {
    if (isMockMode || !db) return;

    try {
      const metadata = await captureClientMetadata();
      const userRef = doc(db, 'users', user.uid);

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        providerId: user.providerData[0]?.providerId || 'unknown',
        lastLoginAt: serverTimestamp(),
        currentSessionId: sessionId,
        metadata,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (e) {
      console.error('Error saving user profile:', e);
    }
  };

  // Persist session to localStorage
  const persistSession = (user: User | any, role: string, sessionId: string | null) => {
    const sessionData = {
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified || false,
        isAnonymous: user.isAnonymous || false
      },
      userRole: role,
      sessionId,
      timestamp: Date.now()
    };
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(sessionData));
  };

  const loginAsGuest = useCallback(() => {
    setMockMode(true);
    const guestUser: any = {
      uid: 'guest-' + Date.now(),
      displayName: 'Invité (Démo)',
      email: 'guest@demo.local',
      isAnonymous: true,
    };
    setUser(guestUser);
    setUserRole('client');
    setSessionId('guest-session');
    setLoading(false);
    persistSession(guestUser, 'client', 'guest-session');
  }, []);

  const loginAsTester = useCallback(() => {
    const tester = injectTestData();
    setUser(tester as any);
    setUserRole('client');
    setSessionId('tester-session');
    setLoading(false);
    persistSession(tester, 'client', 'tester-session');
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      if (result && result.user) {
        const firebaseUser = result.user as User;
        setUser(firebaseUser);
        setUserRole('client');

        // Session will be created by onAuthStateChanged listener
        // But we can also create it here for immediate feedback
        if (!isMockMode) {
          const newSessionId = await getOrCreateSession(firebaseUser);
          setSessionId(newSessionId);
          await saveUserProfile(firebaseUser, newSessionId);
          persistSession(firebaseUser, 'client', newSessionId);
        } else {
          // Mock mode
          persistSession(result.user, 'client', 'mock-session');
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Google Login Error:", error);
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);

      // Firebase logout
      if (!isMockMode) {
        await firebaseLogout();
      }

      // Clear local state
      setUser(null);
      setUserRole('client');
      setSessionId(null);
      setMockMode(false);

      // Clear localStorage
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('siam_visa_pro_session_v2');

      setLoading(false);
    } catch (error) {
      console.error("Logout Error:", error);
      setLoading(false);
      throw error;
    }
  }, []);

  const isAuthenticated = !!user && !user.isAnonymous;

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      sessionId,
      isAuthenticated,
      loginAsGuest,
      loginAsTester,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
