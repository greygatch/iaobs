const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const admin = require('firebase-admin');

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'browserstackautobot@gmail.com',
    pass: 'runkmbzrvshlueru',
  },
});
const APP_NAME = 'BrowserStack Bot';
let waitList = [];

admin.initializeApp();

exports.activeUserChanged = functions.database.ref('/isActive')
  .onWrite((change) => {
    const changeBefore = change.before._data;
    admin.database().ref('waitList').once('value').then((snapshot) => {
      if (snapshot.exists()) {
        waitList = snapshot.val().waitList;
      }
      if ((change.after._data.activeUser === '') && waitList.length !== 0) {
        sendReminderEmail(waitList, changeBefore.activeUser, changeBefore.startTime);
        return true;
      } else {
        return null;
      }
    }).catch(error => {
      console.error(error);
    });
    return null;
});

function sendReminderEmail (waitListArray, beforeName, startTime) {
  const email = waitListArray[0];
  const mailOptions = {
    from: `${APP_NAME} <browserstackautobot@gmail.com>`,
    to: email,
  };
  const currentTime = Date.now();
  const hours = Math.floor((currentTime - startTime)/3600000);
  const shortText = `finally,`;
  const longText = `after only ${hours} hours ...`;
  let shownText = shortText;

  if (hours > 2) {
    shownText = longText;
  }
  mailOptions.subject = `${APP_NAME} Reminder!`;
  mailOptions.text = `Hey there!\nJust wanted to let you know ${beforeName} is done using BrowserStack ${shownText} and now it is YOUR TURN!\n\nI know this is really exciting, (it is for us too trust me) but please don't forget to sign in with the link below!\n\nHave a great day!\nMuch Love,\nE-Vizzle && E-Dizzle\n\nhttps://greygatch.github.io/iaobs/`;
  mailTransport.sendMail(mailOptions);
  console.log('Sending email to: ', email);
  updateWaitList(waitListArray);
}

function updateWaitList (waitListArray) {
  waitListArray.splice(0, 1);
  admin.database().ref('waitList').set({
    waitList: waitListArray
  }, (error) => {
    if (error) {
      console.log(`error updating FB waitList`);
    } else {
      console.log(`success updating waitList`);
    }
  });
}
