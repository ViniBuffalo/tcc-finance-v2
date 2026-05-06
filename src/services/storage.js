import { db, isFirebaseConfigured } from './firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PREFIX = 'findivers_';

// ══════════════════════════════════════
// localStorage helpers (fallback)
// ══════════════════════════════════════

function localGet(key) {
  try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; }
}
function localSet(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

// ══════════════════════════════════════
// Firestore helpers
// ══════════════════════════════════════

async function firestoreGet(userId, field) {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data()[field] ?? null;
    }
    return null;
  } catch (err) {
    console.error('Erro Firestore (get):', err);
    // Fallback para localStorage
    return localGet(`user_${userId}_${field}`);
  }
}

async function firestoreSet(userId, field, value) {
  try {
    await setDoc(doc(db, 'users', userId), { [field]: value }, { merge: true });
    // Também salva em localStorage como cache
    localSet(`user_${userId}_${field}`, value);
  } catch (err) {
    console.error('Erro Firestore (set):', err);
    // Fallback para localStorage
    localSet(`user_${userId}_${field}`, value);
  }
}

// ══════════════════════════════════════
// API pública (funciona com ou sem Firebase)
// ══════════════════════════════════════

/** Obter ativos do usuário */
export async function getAssets(userId) {
  if (isFirebaseConfigured) {
    return (await firestoreGet(userId, 'assets')) || [];
  }
  return localGet(`user_${userId}_assets`) || [];
}

/** Salvar ativos do usuário */
export async function saveAssets(userId, assets) {
  if (isFirebaseConfigured) {
    await firestoreSet(userId, 'assets', assets);
  } else {
    localSet(`user_${userId}_assets`, assets);
  }
}

/** Obter dados genéricos do usuário */
export async function getUserData(userId, key) {
  if (isFirebaseConfigured) {
    return await firestoreGet(userId, key);
  }
  return localGet(`user_${userId}_${key}`);
}

/** Salvar dados genéricos do usuário */
export async function setUserData(userId, key, value) {
  if (isFirebaseConfigured) {
    await firestoreSet(userId, key, value);
  } else {
    localSet(`user_${userId}_${key}`, value);
  }
}

// ══════════════════════════════════════
// Funções legadas (compatibilidade)
// ══════════════════════════════════════

export function getData(key) { return localGet(key); }
export function setData(key, value) { localSet(key, value); }
export function removeData(key) { localStorage.removeItem(PREFIX + key); }
