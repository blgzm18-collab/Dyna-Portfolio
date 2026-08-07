// public/sw.js
self.addEventListener('push', event => {
  const payload = event.data ? event.data.json() : { title: 'Notification', body: '' };
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      data: payload.data,
      icon: payload.icon || '/icons/notification.png'
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/notifications';
  event.waitUntil(clients.openWindow(url));
});
