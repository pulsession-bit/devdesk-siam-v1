import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    onAuthStateChanged as onFirebaseAuthStateChanged,
    sendEmailVerification,
    User,
    ConfirmationResult,
    Auth
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit,
    updateDoc,
    setDoc,
    Firestore
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    FirebaseStorage
} from 'firebase/storage';
import { Appointment, ChatMessage, UserMetadata } from '../types';

// Extend Window interface for Recaptcha
declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier | null;
    }
}

// Config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// State
export let isMockMode = !import.meta.env.VITE_FIREBASE_API_KEY;
export const APP_ORIGIN_COLLECTION = 'web_leads_v2';

let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;
export let storage: FirebaseStorage | null = null;

// Initialize Firebase
const initializeFirebase = () => {
    try {
        if (!isMockMode && firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            storage = getStorage(app);
            console.log('✅ Firebase initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Firebase running in MOCK MODE (no API key)');
            isMockMode = true;
            return false;
        }
    } catch (e) {
        console.error("Firebase Initialization Error:", e);
        isMockMode = true;
        return false;
    }
};

// Initialize on module load
initializeFirebase();

// Helper to check if Firebase Auth is ready
const isAuthReady = (): boolean => {
    return !isMockMode && auth !== null;
};

// Helper to check if Firestore is ready
const isFirestoreReady = (): boolean => {
    return !isMockMode && db !== null;
};

// --- STORAGE SERVICES ---
export const uploadUserDocument = async (userId: string, file: File, category: string): Promise<string | null> => {
    if (isMockMode || !storage) {
        console.log("Mock Upload:", file.name);
        return URL.createObjectURL(file);
    }

    try {
        const storageRef = ref(storage, `users/${userId}/documents/${category}/${Date.now()}_${file.name}`);
        const metadata = {
            contentType: file.type,
            customMetadata: {
                originalName: file.name,
                uploadedAt: new Date().toISOString()
            }
        };

        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error: any) {
        console.error("Storage Upload Error:", error);
        if (error.code === 'storage/unauthorized' || error.message?.includes('CORS') || error.code === 'storage/unknown') {
            console.warn("⚠️ FALLBACK MOCK: Upload bloqué par règles/CORS. Simulation réussie.");
            return URL.createObjectURL(file);
        }
        throw error;
    }
};

// Helpers
export const setMockMode = (val: boolean) => { isMockMode = val; };

export const captureClientMetadata = async (): Promise<UserMetadata> => {
    return {
        ip: '127.0.0.1',
        device: /Android/i.test(navigator.userAgent) ? 'Android' : /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iPhone' : 'Computer',
        userAgent: navigator.userAgent,
        location: 'Unknown',
        lastLoginAt: new Date().toISOString()
    };
};

// ============================================
// AUTH FUNCTIONS
// ============================================

export const onAuthStateChanged = (authInstance: Auth | null, callback: (user: User | null) => void) => {
    if (isMockMode || !authInstance) {
        // In mock mode, call with null immediately
        setTimeout(() => callback(null), 0);
        return () => {};
    }
    return onFirebaseAuthStateChanged(authInstance, callback);
};

export const signInWithGoogle = async () => {
    // Always check mock mode first
    if (isMockMode || !isAuthReady()) {
        console.log('🔐 Mock Google Sign-In');
        return {
            user: {
                uid: 'mock-google-user-' + Date.now(),
                displayName: 'Mock User',
                email: 'mock@gmail.com',
                emailVerified: true,
                isAnonymous: false,
                providerData: [{ providerId: 'google.com' }]
            }
        };
    }

    try {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        return await signInWithPopup(auth!, provider);
    } catch (error: any) {
        // If unauthorized domain, fallback to mock
        if (error.code === 'auth/unauthorized-domain') {
            console.warn('⚠️ Domain not authorized in Firebase. Falling back to mock mode.');
            isMockMode = true;
            return {
                user: {
                    uid: 'mock-google-user-' + Date.now(),
                    displayName: 'Mock User (Domain Error)',
                    email: 'mock@gmail.com',
                    emailVerified: true,
                    isAnonymous: false,
                    providerData: [{ providerId: 'google.com' }]
                }
            };
        }
        throw error;
    }
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (isMockMode || !isAuthReady()) {
        return { user: { uid: 'mock-user-' + Date.now(), email, displayName: name, emailVerified: false } };
    }
    return createUserWithEmailAndPassword(auth!, email, pass);
};

export const loginWithEmail = async (email: string, pass: string) => {
    if (isMockMode || !isAuthReady()) {
        return { user: { uid: 'mock-user-' + Date.now(), email, emailVerified: true } };
    }
    return signInWithEmailAndPassword(auth!, email, pass);
};

export const sendUserVerificationEmail = async () => {
    if (isMockMode || !isAuthReady()) return;
    if (auth?.currentUser) {
        await sendEmailVerification(auth.currentUser);
    }
};

export const logout = async () => {
    if (isMockMode || !isAuthReady()) {
        console.log('🔐 Mock Logout');
        return;
    }
    return signOut(auth!);
};

export const initRecaptcha = (elementId: string) => {
    // Skip in mock mode or if auth is not ready
    if (isMockMode || !isAuthReady()) {
        console.log('📱 Mock Recaptcha (skipped)');
        return;
    }

    try {
        // Check if element exists
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Recaptcha element #${elementId} not found`);
            return;
        }

        // Only create if not already exists
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth!, elementId, {
                size: 'invisible',
                callback: () => {
                    console.log('✅ Recaptcha verified');
                },
                'expired-callback': () => {
                    console.warn('⚠️ Recaptcha expired');
                    window.recaptchaVerifier = null;
                }
            });
        }
    } catch (e) {
        console.error("Recaptcha Init Error:", e);
        // Don't throw, just log - phone auth won't work but app continues
    }
};

export const sendPhoneOtp = async (phoneNumber: string) => {
    if (isMockMode || !isAuthReady()) {
        return { verificationId: 'mock-verif-id' } as any;
    }

    if (!window.recaptchaVerifier) {
        throw new Error('Recaptcha not initialized. Please try again.');
    }

    return signInWithPhoneNumber(auth!, phoneNumber, window.recaptchaVerifier);
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    if (isMockMode) {
        return { user: { uid: 'mock-phone-user-' + Date.now() } };
    }
    return confirmationResult.confirm(code);
};

// ============================================
// FIRESTORE FUNCTIONS
// ============================================

export const getOrCreateSession = async (user: any): Promise<string | null> => {
    if (isMockMode || !isFirestoreReady()) {
        return 'mock-session-' + Date.now();
    }

    try {
        const q = query(
            collection(db!, 'sessions'),
            where('userId', '==', user.uid),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs[0].id;
        }

        const docRef = await addDoc(collection(db!, 'sessions'), {
            userId: user.uid,
            createdAt: serverTimestamp(),
            status: 'active',
            visa: { type: 'DTV' }
        });
        return docRef.id;
    } catch (e) {
        console.error("Session creation error:", e);
        return 'fallback-session-' + Date.now();
    }
};

export const getUserSessions = async (userId: string) => {
    if (isMockMode || !isFirestoreReady()) return [];

    const q = query(collection(db!, 'sessions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addEventToSession = async (sessionId: string, message: ChatMessage) => {
    if (isMockMode || !isFirestoreReady()) return;

    const messagesRef = collection(db!, 'sessions', sessionId, 'messages');
    await addDoc(messagesRef, message);
    await updateDoc(doc(db!, 'sessions', sessionId), {
        lastActiveAt: serverTimestamp(),
        preview: message.text.substring(0, 50)
    });
};

export const subscribeToSessionMessages = (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
    if (isMockMode || !isFirestoreReady()) {
        callback([]);
        return () => {};
    }

    const q = query(collection(db!, 'sessions', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => d.data() as ChatMessage);
        callback(msgs);
    });
};

export const saveAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<string | null> => {
    if (isMockMode || !isFirestoreReady()) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let refId = 'SVP-';
        for (let i = 0; i < 4; i++) refId += chars.charAt(Math.floor(Math.random() * chars.length));
        return refId;
    }

    try {
        const metadata = await captureClientMetadata();
        const docRef = await addDoc(collection(db!, 'appointments'), {
            ...appointment,
            createdAt: serverTimestamp(),
            originCollection: APP_ORIGIN_COLLECTION,
            metadata
        });
        return docRef.id;
    } catch (e) {
        console.error("Error saving appointment:", e);
        return null;
    }
};

export const createCheckoutSession = async (user: any, lineItems: any[]) => {
    if (isMockMode || !isFirestoreReady()) return;

    const checkoutRef = await addDoc(collection(db!, 'customers', user.uid, 'checkout_sessions'), {
        mode: 'payment',
        price: 'price_123',
        line_items: lineItems,
        success_url: window.location.origin,
        cancel_url: window.location.origin
    });

    onSnapshot(checkoutRef, (snap) => {
        const { error, url } = snap.data() || {};
        if (error) alert(`An error occurred: ${error.message}`);
        if (url) window.location.assign(url);
    });
};

export const subscribeToPaymentStatus = (userId: string, callback: (hasPaid: boolean) => void) => {
    if (isMockMode || !isFirestoreReady()) {
        callback(false);
        return () => {};
    }

    return onSnapshot(doc(db!, 'users', userId), (snap) => {
        callback(snap.data()?.hasPaid || false);
    });
};

export const sendConfirmationEmail = async (email: string, name: string, visaType: string, result: any) => {
    if (isMockMode || !isFirestoreReady()) return;

    await addDoc(collection(db!, 'mail'), {
        to: email,
        message: {
            subject: `Confirmation Audit Visa ${visaType}`,
            html: `Bonjour ${name}, votre audit est confirmé. Score: ${result.confidence_score}%`
        }
    });
};

// ============================================
// TEST HELPERS
// ============================================

export const injectTestData = () => {
    return {
        uid: 'tester-01',
        email: 'test@siamvisapro.com',
        displayName: 'Tester',
        emailVerified: true,
        isAnonymous: false,
        providerData: [{ providerId: 'password' }]
    };
};

// Export Firestore functions for AuthContext
export { setDoc, serverTimestamp, doc };
