importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBmh4fqvWpGLietTIESEyd6BkTCtMnMquw",
  authDomain: "league-91565.firebaseapp.com",
  projectId: "league-91565",
  storageBucket: "league-91565.firebasestorage.app",
  messagingSenderId: "923003244062",
  appId: "1:923003244062:web:a2bf91b86de0d1bf73a80f"
});

const messaging = firebase.messaging();

// التعامل مع الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
