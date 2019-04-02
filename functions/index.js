const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const APP_NAME = 'BrowserStack Bot';

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'browserstackautobot@gmail.com',
    pass: 'runkmbzrvshlueru',
  },
});

admin.initializeApp();

exports.activeUserChanged = functions.database.ref('/isActive/activeUser')
  .onWrite((change) => {
    let waitList;
    admin.database().ref('waitList').once('value').then((snapshot) => {
      waitList = snapshot.val().waitList;
      if ((change.after._data === '') && waitList.length !== 0) {
        updateWaitList(waitList, change.before._data);
        return true;
      } else {
        return null;
      }
    }).catch(error => {
      console.error(error);
    });
    return null;
});

function updateWaitList (array, beforeName) {
  sendReminderEmail(array[0], beforeName);
  array.splice(0,1);
  admin.database().ref('waitList').set({
    waitList: array
  }, (error) => {
    if (error) {
      console.log(`error updating FB waitList`);
    } else {
      console.log(`success updating waitList`);
    }
  });
}

function sendReminderEmail (email, beforeName) {
  const mailOptions = {
    from: `${APP_NAME} <browserstackautobot@gmail.com>`,
    to: email,
  };

  mailOptions.subject = `${APP_NAME} Reminder!`;
  mailOptions.text = `Just wanted to let you know ${beforeName} is done using BrowserStack ... finally, and now it is YOUR TURN!\n\nI know this is really exciting, (it is for us too trust me) but please don't forget to sign in with the link below!\n\nHave a great day!\nMuch Love,\nE-Vizzle && E-Dizzle\n\nhttps://greygatch.github.io/iaobs/`;
  mailTransport.sendMail(mailOptions);
  console.log('Sending email to: ', email);
}
