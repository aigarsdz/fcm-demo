var config = {
  apiKey:            'AIzaSyBVLbqpVzvN2QD9wE04nG3-fGInlkmJHI0',
  authDomain:        'fcm-demo-4aabc.firebaseapp.com',
  databaseURL:       'https://fcm-demo-4aabc.firebaseio.com',
  projectId:         'fcm-demo-4aabc',
  storageBucket:     'fcm-demo-4aabc.appspot.com',
  messagingSenderId: '55371627750'
};

firebase.initializeApp(config);

var messaging = firebase.messaging();

navigator.serviceWorker.register('/javascripts/firebase-messaging-sw.js')
  .then(function(registration) {
    messaging.useServiceWorker(registration);
    getToken();
  });

/**
 * Retrieves the current registration token and sends it to the server.
 */
var getToken = function() {
  messaging.getToken().then(function(token) {
    fetch('/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token })
    }).catch(function(error) {
      displayMessage("Error: couldn't send the registration token to the server.", 'red');
    });
  }).catch(function(error) {
    displayMessage("Error: couldn't retrieve the registration token.", 'red');
  });
};

var sendMessage = function(event) {
  event.preventDefault();

  var message = document.getElementById('message').value.trim();

  if (message.length > 0) {
    fetch('/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    }).catch(function(error) {
      displayMessage("Error: couldn't send the message.", 'red');
    });

    document.getElementById('message').value = '';
  }
};

/**
 * Appends a new message to the chat.
 *
 * @param {String} messageText
 * @param {String} [color]
 */
var displayMessage = function(messageText, color) {
  var p = document.createElement('p');

  if (color) {
    messageText = '<span style="color: ' + color + ';">' + messageText + '<span>';
  }

  p.innerHTML = '> ' + messageText;

  document.getElementById('messages').appendChild(p);
  scroll();
};

/**
 * Scrolls chat automatically if necessary.
 */
function scroll() {
  var autoScrollAllowed = true;
  var element           = document.getElementById('messages');
  var scrollTop         = element.scrollTop;
  var scrollHeight      = element.scrollHeight;

  // If the user has scrolled up (but not up all the way) disable auto scroll
  // so he could read previous messages while other messages arrive.
  if (scrollTop !== 0 && scrollHeight !== element.clientHeight + scrollTop + 24) {
    autoScrollAllowed = false;
  }

  if (autoScrollAllowed) {
    element.scrollTop = scrollHeight;
  }
}

messaging.requestPermission().catch(function(error) {
  displayMessage("Warning: without enabling notifications the chat might not work properly.", 'coral');
});

messaging.onTokenRefresh(getToken);

messaging.onMessage(function(payload) {
  displayMessage(payload.data['message]']);
});

document.querySelector('#message-form').addEventListener('submit', sendMessage);
