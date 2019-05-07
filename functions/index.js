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
let waitListKeys = [];

admin.initializeApp();

exports.activeUserChanged = functions.database.ref('/accounts')
  .onWrite((change) => {
    let userWentInactive = false;
    let beforeActiveUser;
    let beforeStartTime;
    let changedAccount;

    const changeBefore = change.before._data;
    Object.keys(changeBefore).forEach((key) => {
      if ((changeBefore[key].activeUser !== '') && (change.after._data[key].activeUser === '')) {
        userWentInactive = true;
        beforeActiveUser = changeBefore[key].activeUser;
        beforeStartTime = changeBefore[key].startTime;
        changedAccount = key;
      }
    })
    admin.database().ref('waitList').once('value').then((snapshot) => {
      if (snapshot.exists()) {
        waitList = snapshot.val().waitList;
        waitListKeys = snapshot.val().waitListKeys;
      }
      if ((userWentInactive) && waitList.length !== 0) {
        sendReminderEmail(waitList, waitListKeys, beforeActiveUser, beforeStartTime, changedAccount);
        return true;
      } else {
        return null;
      }
    }).catch(error => {
      console.error(error);
    });
    return null;
});

function sendReminderEmail (waitListArray, waitListKeys, beforeName, startTime, changedAccount) {
  const upperCaseWaitListKeys = [];
  waitListKeys.forEach((key) => {upperCaseWaitListKeys.push(key.toUpperCase())})
  const indexOfChangedAccountEmail =  upperCaseWaitListKeys.indexOf(accountName.toUpperCase());
  const email = waitListArray[indexOfChangedAccountEmail];
  const mailOptions = {
    from: `${APP_NAME} <browserstackautobot@gmail.com>`,
    to: email,
  };
  const currentTime = Date.now();
  const hours = Math.floor((currentTime - startTime)/3600000);
  const shortText = `finally,`;
  const longText = `after only ${hours} hours ...`;

  let shownText = shortText;
  let accountName = changedAccount.split('');
  accountName.splice(0, 1, accountName[0].toUpperCase())
  accountName = accountName.join('');

  if (hours > 2) {
    shownText = longText;
  }

  mailOptions.subject = `${APP_NAME} Reminder!`;
  mailOptions.text = `Hey there!\nJust wanted to let you know ${beforeName} is done using ${accountName}'s BrowserStack account ${shownText} and now it is YOUR TURN!\n\nI know this is really exciting, (it is for us too trust me) but please don't forget to sign in with the link below!\n\nHave a great day!\nMuch Love,\nE-Vizzle && E-Dizzle\n\nhttps://greygatch.github.io/iaobs/`;

  if (indexOfChangedAccountEmail !== -1) {
    mailTransport.sendMail(mailOptions);
    console.log('Sending email to: ', email);
    updateWaitList(waitListArray, waitListKeys, indexOfChangedAccountEmail);
  }
}

function updateWaitList (waitListArray, waitListKeys, indexOfChangedAccountEmail) {
  waitListArray.splice(indexOfChangedAccountEmail, 1);
  waitListKeys.splice(indexOfChangedAccountEmail, 1);
  admin.database().ref('waitList').set({
    waitList: waitListArray,
    waitListKeys: waitListKeys
  }, (error) => {
    if (error) {
      console.log(`error updating FB waitList`);
    } else {
      console.log(`success updating waitList`);
    }
  });
}
