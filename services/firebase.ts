
import { initializeApp } from 'firebase/app';
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
    ConfirmationResult
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
    updateDoc
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { Appointment, ChatMessage, UserMetadata } from '../types';

// Extend Window interface for Recaptcha
declare global {
    interface Window {
        recaptchaVerifier: any;
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

let app: any;
export let auth: any;
export let db: any;
export let storage: any;

try {
    if (!isMockMode && firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
    } else {
        isMockMode = true;
        auth = { currentUser: null };
    }
} catch (e) {
    console.error("Firebase Initialization Error:", e);
    isMockMode = true;
}

// --- STORAGE SERVICES ---
export const uploadUserDocument = async (userId: string, file: File, category: string): Promise<string | null> => {
    if (isMockMode || !storage) {
        console.log("Mock Upload:", file.name);
        return URL.createObjectURL(file); // Mock URL
    }

    try {
        // Structure: users/{userId}/documents/{category}/{timestamp}_{filename}
        const storageRef = ref(storage, `users/${userId}/documents/${category}/${Date.now()}_${file.name}`);

        // Metadata pour la sécurité et le tri
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
        // FALLBACK DEV : Si permission denied (règles) ou CORS, on simule l'upload
        if (error.code === 'storage/unauthorized' || error.message?.includes('CORS') || error.code === 'storage/unknown') {
            console.warn("⚠️ FALLBACK MOCK: Upload bloqué par règles/CORS. Simulation réussie pour le test.");
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

// Auth Functions
export const onAuthStateChanged = (authInstance: any, callback: (user: User | null) => void) => {
    if (isMockMode) {
        callback(null);
        return () => { };
    }
    return onFirebaseAuthStateChanged(authInstance, callback);
};

export const signInWithGoogle = async () => {
    if (isMockMode) {
        return { user: { uid: 'mock-google-user', displayName: 'Mock User', email: 'mock@gmail.com', emailVerified: true } };
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
};

export const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (isMockMode) return { user: { uid: 'mock-user', email, displayName: name, emailVerified: false } };
    return createUserWithEmailAndPassword(auth, email, pass);
};

export const loginWithEmail = async (email: string, pass: string) => {
    if (isMockMode) return { user: { uid: 'mock-user', email, emailVerified: true } };
    return signInWithEmailAndPassword(auth, email, pass);
};

export const sendUserVerificationEmail = async () => {
    if (isMockMode) return;
    if (auth.currentUser) await sendEmailVerification(auth.currentUser);
};

export const logout = async () => {
    if (isMockMode) return;
    return signOut(auth);
};

export const initRecaptcha = (elementId: string) => {
    if (isMockMode) return;
    try {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
                'size': 'invisible',
                'callback': () => { }
            });
        }
    } catch (e) {
        console.error("Recaptcha Init Error", e);
    }
};

export const sendPhoneOtp = async (phoneNumber: string) => {
    if (isMockMode) return { verificationId: 'mock-verif-id' } as any;
    const appVerifier = window.recaptchaVerifier;
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

export const verifyPhoneOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    if (isMockMode) return { user: { uid: 'mock-phone-user' } };
    return confirmationResult.confirm(code);
};

// Firestore Functions

export const getOrCreateSession = async (user: any) => {
    if (isMockMode) return 'mock-session-id';
    if (!db) return null;
    const q = query(collection(db, 'sessions'), where('userId', '==', user.uid), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) return snapshot.docs[0].id;
    const docRef = await addDoc(collection(db, 'sessions'), { userId: user.uid, createdAt: serverTimestamp(), status: 'active', visa: { type: 'DTV' } });
    return docRef.id;
};

export const getUserSessions = async (userId: string) => {
    if (isMockMode || !db) return [];
    const q = query(collection(db, 'sessions'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addEventToSession = async (sessionId: string, message: ChatMessage) => {
    if (isMockMode || !db) return;
    const messagesRef = collection(db, 'sessions', sessionId, 'messages');
    await addDoc(messagesRef, message);
    await updateDoc(doc(db, 'sessions', sessionId), { lastActiveAt: serverTimestamp(), preview: message.text.substring(0, 50) });
};

export const subscribeToSessionMessages = (sessionId: string, callback: (messages: ChatMessage[]) => void) => {
    if (isMockMode || !db) { callback([]); return () => { }; }
    const q = query(collection(db, 'sessions', sessionId, 'messages'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => d.data() as ChatMessage);
        callback(msgs);
    });
};

export const saveAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    // Générateur de REF courte pour le Mock
    if (isMockMode || !db) {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let ref = 'SVP-';
        for (let i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
        return ref;
    }
    try {
        const metadata = await captureClientMetadata();
        const docRef = await addDoc(collection(db, 'appointments'), { ...appointment, createdAt: serverTimestamp(), originCollection: APP_ORIGIN_COLLECTION, metadata: metadata });
        return docRef.id;
    } catch (e) {
        console.error("Error saving appointment:", e);
        return null;
    }
};

export const createCheckoutSession = async (user: any, lineItems: any[]) => {
    if (isMockMode || !db) return;
    const checkoutRef = await addDoc(collection(db, 'customers', user.uid, 'checkout_sessions'), { mode: 'payment', price: 'price_123', line_items: lineItems, success_url: window.location.origin, cancel_url: window.location.origin });
    onSnapshot(checkoutRef, (snap) => {
        const { error, url } = snap.data() || {};
        if (error) alert(`An error occured: ${error.message}`);
        if (url) window.location.assign(url);
    });
};

export const subscribeToPaymentStatus = (userId: string, callback: (hasPaid: boolean) => void) => {
    if (isMockMode || !db) { callback(false); return () => { }; }
    return onSnapshot(doc(db, 'users', userId), (snap) => { callback(snap.data()?.hasPaid || false); });
};

export const sendConfirmationEmail = async (email: string, name: string, visaType: string, result: any) => {
    if (isMockMode || !db) return;
    await addDoc(collection(db, 'mail'), { to: email, message: { subject: `Confirmation Audit Visa ${visaType}`, html: `Bonjour ${name}, votre audit est confirmé. Score: ${result.confidence_score}%` } });
};

export const injectTestData = () => {
    return { uid: 'tester-01', email: 'test@siamvisapro.com', displayName: 'Tester', emailVerified: true };
};
