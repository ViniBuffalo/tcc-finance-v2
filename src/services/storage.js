const PREFIX = 'findivers_';

/** Get data from localStorage */
export function getData(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Set data to localStorage */
export function setData(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

/** Remove data from localStorage */
export function removeData(key) {
  localStorage.removeItem(PREFIX + key);
}

/** Get user-scoped data */
export function getUserData(userId, key) {
  return getData(`user_${userId}_${key}`);
}

/** Set user-scoped data */
export function setUserData(userId, key, value) {
  setData(`user_${userId}_${key}`, value);
}

/** Get all assets for a user */
export function getAssets(userId) {
  return getUserData(userId, 'assets') || [];
}

/** Save assets for a user */
export function saveAssets(userId, assets) {
  setUserData(userId, 'assets', assets);
}

/** Get transactions for a user */
export function getTransactions(userId) {
  return getUserData(userId, 'transactions') || [];
}

/** Save transactions for a user */
export function saveTransactions(userId, transactions) {
  setUserData(userId, 'transactions', transactions);
}
