import { auth, isFirebaseConfigured } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

// ══════════════════════════════════════
// Fallback localStorage (quando Firebase não está configurado)
// ══════════════════════════════════════

const PREFIX = 'findivers_';

function getLocalData(key) {
  try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; }
}
function setLocalData(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ══════════════════════════════════════
// API pública (funciona com ou sem Firebase)
// ══════════════════════════════════════

/** Registrar novo usuário */
export async function registerUser(name, email, password) {
  if (isFirebaseConfigured) {
    // ─── Firebase Auth ───
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Salvar perfil no Firestore
    await setDoc(doc(db, 'users', cred.user.uid), {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    });

    const session = { id: cred.user.uid, name, email: cred.user.email };
    sessionStorage.setItem('findivers_session', JSON.stringify(session));
    return session;
  } else {
    // ─── Fallback localStorage ───
    const users = getLocalData('users') || [];
    if (users.find(u => u.email === email.toLowerCase())) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const hashedPw = await hashPassword(password);
    const user = { id: uid(), name: name.trim(), email: email.toLowerCase().trim(), password: hashedPw, createdAt: new Date().toISOString() };
    users.push(user);
    setLocalData('users', users);
    const session = { id: user.id, name: user.name, email: user.email };
    sessionStorage.setItem('findivers_session', JSON.stringify(session));
    return session;
  }
}

/** Login do usuário */
export async function loginUser(email, password) {
  if (isFirebaseConfigured) {
    // ─── Firebase Auth ───
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const session = { id: cred.user.uid, name: cred.user.displayName || 'Usuário', email: cred.user.email };
    sessionStorage.setItem('findivers_session', JSON.stringify(session));
    return session;
  } else {
    // ─── Fallback localStorage ───
    const users = getLocalData('users') || [];
    const hashedPw = await hashPassword(password);
    const user = users.find(u => u.email === email.toLowerCase().trim() && u.password === hashedPw);
    if (!user) throw new Error('E-mail ou senha inválidos.');
    const session = { id: user.id, name: user.name, email: user.email };
    sessionStorage.setItem('findivers_session', JSON.stringify(session));
    return session;
  }
}

/** Obter sessão atual */
export function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem('findivers_session'));
  } catch { return null; }
}

/** Logout */
export async function logout() {
  if (isFirebaseConfigured && auth) {
    try { await signOut(auth); } catch (e) { console.error('Erro no logout:', e); }
  }
  sessionStorage.removeItem('findivers_session');
}

/** Listener para mudanças de autenticação (Firebase) */
export function onAuthChange(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const session = { id: user.uid, name: user.displayName || 'Usuário', email: user.email };
        sessionStorage.setItem('findivers_session', JSON.stringify(session));
        callback(session);
      } else {
        sessionStorage.removeItem('findivers_session');
        callback(null);
      }
    });
  }
  return () => {};
}
