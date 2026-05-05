import { getData, setData } from './storage.js';
import { uid } from '../utils/formatters.js';

const USERS_KEY = 'users';

/** Hash password using SHA-256 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Register a new user */
export async function registerUser(name, email, password) {
  const users = getData(USERS_KEY) || [];

  if (users.find(u => u.email === email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.');
  }

  const hashedPw = await hashPassword(password);
  const user = {
    id: uid(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPw,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  setData(USERS_KEY, users);

  // Store session
  const session = { id: user.id, name: user.name, email: user.email };
  sessionStorage.setItem('findivers_session', JSON.stringify(session));

  return session;
}

/** Login user */
export async function loginUser(email, password) {
  const users = getData(USERS_KEY) || [];
  const hashedPw = await hashPassword(password);

  const user = users.find(u => u.email === email.toLowerCase().trim() && u.password === hashedPw);
  if (!user) throw new Error('E-mail ou senha inválidos.');

  const session = { id: user.id, name: user.name, email: user.email };
  sessionStorage.setItem('findivers_session', JSON.stringify(session));

  return session;
}

/** Get current session */
export function getSession() {
  try {
    const raw = sessionStorage.getItem('findivers_session');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Logout */
export function logout() {
  sessionStorage.removeItem('findivers_session');
}
