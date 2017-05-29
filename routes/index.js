var express = require('express');
var router  = express.Router();
var request = require('request');

var authKey     = process.env.FCM_SERVER_KEY;
var collapseKey = 'Chat message';
var tokens = new Set();

/**
 * Displays the main page.
 */
router.get('/', (req, res) => {
  // NOTE: This is used to display the message from a notification when the
  // page loads.
  const message = req.query.message || '';

  res.render('index', { title: 'FCM Chat', message: message  });
});

/**
 * Stores registration tokens received from clients in a set.
 */
router.post('/token', (req, res) => {
  tokens.add(req.body.token);
  res.send('OK');
});

/**
 * Broadcasts messages.
 */
router.post('/message', (req, res) => {
  const message = req.body.message;

  if (message && message.length > 0) {
    const promises = [];
    const headers  = {
      'Content-Type': 'application/json',
      'Authorization': 'key=' + authKey
    };

    const notification = {
      title: 'New message',
      body: req.body.message,
      icon: '/images/Speech Bubble-96.png'
    };

    // NOTE: I'm still not sure if there are separate tokens used for every
    // client or only one for all of them. The current implementation
    // expects there to be many, but it will work just fine with only one token.
    tokens.forEach(function(token) {
      promises.push(new Promise((resolve, reject) => {
        request({
          url: 'https://fcm.googleapis.com/fcm/send',
          method: 'POST',
          headers: headers,
          form: {
            to: token,
            collapse_key: collapseKey,
            data: { message: req.body.message },
            notification: notification
          }
        }).on('response', (response) => {
          resolve(response);
        }).on('error', (error) => {
          resolve("Couldn't broadcast the message: " + error);
        });
      }));
    });

    Promise.all(promises).then(function() {
      res.send('Message sent');
    }).catch(function(error) {
      res.send('An error occurred while trying to send a message');
    });
  } else {
    res.send('Message is empty');
  }
});

module.exports = router;
