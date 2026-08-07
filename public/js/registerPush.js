// public/js/registerPush.js
// Minimal client script. Exposes window.registerForPush(vapidPublicKey).
// Usage (in browser console or from your mod UI):
//   window.registerForPush('<VAPID_PUBLIC_KEY>');
async function registerForPush(vapidPublicKey) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });

    // send subscription to server
    const resp = await fetch('/api/save-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription)
    });

    if (!resp.ok) {
      console.error('Failed to save subscription', await resp.text());
      return null;
    }

    return subscription;
  } catch (err) {
    console.error('registerForPush error', err);
    return null;
  }
}

// helper: convert VAPID public key (base64url) to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// expose for console usage
window.registerForPush = registerForPush;
