/** Simple hash-based SPA router */

const routes = {};
let currentRoute = null;

export function registerRoute(name, handler) {
  routes[name] = handler;
}

export function navigate(route) {
  window.location.hash = route;
}

export function getCurrentRoute() {
  return currentRoute || 'dashboard';
}

export function initRouter(onChange) {
  function handleHash() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    if (hash !== currentRoute) {
      currentRoute = hash;
      onChange(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();
}
