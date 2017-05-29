importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

firebase.initializeApp({
  'messagingSenderId': '55371627750'
});

var messaging = firebase.messaging();
var notificationMessage;

messaging.setBackgroundMessageHandler(function(payload) {
  notificationMessage = payload.data['message]'];

  var notificationTitle = 'New message';
  var notificationOptions = {
    body: notificationMessage,
    icon: '/images/Speech Bubble-96.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  var url = 'localhost:3000';

  event.notification.close();
  event.waitUntil(
    clients.matchAll({
      includeUncontrolled: true,
      type: 'window'
    }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var currentClient = windowClients[i];

        if (currentClient.url.indexOf(url) !== -1) {
          return currentClient.focus();
        }
      }

      return clients.openWindow('http://' + url + '?message=' + encodeURIComponent(notificationMessage));
    })
  );
});