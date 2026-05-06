import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config — lido das variáveis de ambiente (arquivo .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verifica se o Firebase está configurado
export const isFirebaseConfigured = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'sua-api-key-aqui';

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('🔥 Firebase conectado!');
} else {
  console.warn('⚠️ Firebase não configurado. Usando armazenamento local (localStorage).');
}

export { app, auth, db };
