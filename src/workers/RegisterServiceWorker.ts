export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Avoid running SW caching while in active local Vite development
  // if (import.meta.env.DEV) {
  //   return;
  // }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg: ServiceWorkerRegistration) => {
        reg.addEventListener('updatefound', () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.info('[SW] New version available.');
            }
          });
        });
      })
      .catch((err: unknown) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}