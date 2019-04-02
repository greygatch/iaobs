const config = {
  apiKey: "AIzaSyDKw3mLK-1U5YeE9MccAD761q1Jfcs5pWU",
  authDomain: "iaobs-3941b.firebaseapp.com",
  databaseURL: "https://iaobs-3941b.firebaseio.com",
  projectId: "iaobs-3941b",
  storageBucket: "iaobs-3941b.appspot.com",
  messagingSenderId: "981123119987"
};

firebase.initializeApp(config);

const db = firebase.database();
const activeDiv = document.getElementById('active-status');
const activeTimer = document.getElementById('active-timer');
const stopButton = document.getElementById('stop-button');
const useButton = document.getElementById('use-button');
const userNameInput = document.getElementById('user-name');
const userEmailInput = document.getElementById('user-email');
const waitListUI = document.getElementById('wait-list');
const userEmailRow = document.getElementById('user-email-row');
const addEmailButton = document.getElementById('add-user-email');
const emailInstructions = document.getElementById('email-instructions');
const appInstructions = document.getElementById('app-instructions');

const appInstructionText = `Enter your name to reserve BrowserStack!`;
const emailInstructionText = `Enter your email to be notified when BrowserStack becomes available!`;
const coffeeBeanAliasArray = ['courtney', 'cb', 'c-money', 'court', 'c-brizzle', 'c-b', 'brothers', 'courtney brothers']

let activeUser;
let isActive;
let startTime;
let waitList = [];
let timerStartValue;
let timerIsActive = false;

stopButton.addEventListener('click', stopUsingBrowserStack);
useButton.addEventListener('click', beginUsingBrowserStack);
addEmailButton.addEventListener('click', addToWaitList);
userNameInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    beginUsingBrowserStack();
  }
});

userEmailInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    addToWaitList();
  }
});

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
  db.ref('isActive').on('value', snap => {
    if(snap.val()) {
      activeUser = snap.val().activeUser;
      isActive = snap.val().isActive;
      startTime = snap.val().startTime;
    } else {
      updateIsActive(false, '', 0)
    }
    if (isActive) {
      setActive();
    } else {
      setInActive();
    }
  });

  db.ref('waitList').on('value', snap => {
    if(snap.val()) {
      waitList = snap.val().waitList;
      createList(waitList);
    } else {
      waitList = [];
      createList(waitList);
    }
  });
}

/* <<------------------ User Actions ------------------>> */
function beginUsingBrowserStack() {
  startTime = getSystemTime();

  if (userNameInput.value === ``) {
    appInstructions.innerHTML = `Please enter a name!`;
    appInstructions.style.color = 'firebrick'
  } else if (coffeeBeanAliasArray.indexOf(userNameInput.value.toLowerCase()) !== -1) {
    updateIsActive(true, 'Coffee Bean', startTime);
  } else {
    appInstructions.style.color = ''
    updateIsActive(true, userNameInput.value, startTime);
  }
}

function stopUsingBrowserStack() {
  const formmatedString = activeTimer.innerHTML.replace(/&nbsp;/g, ` `);

  updateLogs(activeUser, formmatedString);
  updateIsActive(false, ``, 0);
}

function addToWaitList() {
  const emailInput = userEmailInput.value;
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

  if (emailInput.match(emailRegex)) {
    waitList.push(userEmailInput.value);
    userEmailInput.value = "";
    emailInstructions.innerHTML = emailInstructionText;
    emailInstructions.style.color = '';
    updateWaitList(waitList);
    createList(waitList);
  } else {
    emailInstructions.innerHTML = `Please enter a valid email!`;
    emailInstructions.style.color = 'firebrick';
  }
}

function deleteFromWaitList() {
  waitList.splice(this.value, 1);
  updateWaitList(waitList);
}

/* <<------------------ App Functions ------------------>> */
function setActive() {
  activeDiv.innerHTML = `${activeUser} has been using BrowserStack`;
  stopButton.disabled = false;
  activeTimer.style.height = '15px';
  useButton.disabled = true;
  userNameInput.disabled = true;
  userNameInput.value = ``;
  appInstructions.innerHTML = ``;
  startTimer(startTime);
}

function setInActive() {
  activeDiv.innerHTML = `BrowserStack is free to use!`;
  activeTimer.innerHTML = ``;
  activeTimer.style.height = '';
  appInstructions.innerHTML = appInstructionText;
  stopButton.disabled = true;
  useButton.disabled = false;
  userNameInput.disabled = false;
}

// Init the timer and set the starting value.
function startTimer(startNumber) {
  const initTimer = getSystemTime();
  timerStartValue = Math.floor((initTimer - startNumber)/1000);
  if (!timerIsActive) {
    setInterval(incrementTimer, 1000);
  }
}

// Add 1 every second to the timer value & display.
function incrementTimer() {
  if (isActive) {
    timerIsActive = true;
    ++timerStartValue;
    activeTimer.innerHTML = formatTimer(timerStartValue);
  }
}

// Format timer to human readable string.
function formatTimer(time) {
  let seconds;
  let hours;
  let minutes;
  let stringMinutes = ``;
  let stringHours = ``;
  let stringSeconds = `&nbsp;seconds`;

  const stringStart = `For&nbsp;`;

  if (time > 7200) {
    seconds = time % 60;
    minutes = Math.floor((time % 3600)/60);
    hours = Math.floor(time/3600);
    stringMinutes = `&nbsp;minutes&nbsp;and&nbsp;`;
    stringHours = `&nbsp;hours&nbsp;and&nbsp;`;
  } else if (time > 3600) {
    seconds = time % 60;
    minutes = Math.floor((time % 3600)/60);
    hours = Math.floor(time/3600);
    stringMinutes = `&nbsp;minutes&nbsp;and&nbsp;`;
    stringHours = `&nbsp;hour&nbsp;and&nbsp;`;
  } else if (time > 120) {
    seconds = (time % 60);
    minutes = Math.floor(time/60);
    hours = ``;
    stringMinutes = `&nbsp;minutes&nbsp;and&nbsp;`;
   } else if (time > 60) {
    seconds = (time % 60);
    minutes = Math.floor(time/60);
    hours = ``;
    stringMinutes = `&nbsp;minute&nbsp;and&nbsp;`;
  } else {
    seconds = time;
    minutes = ``;
    hours = ``;
    time == 1 ? stringSeconds = `&nbsp;second` : null;
  }

  return stringStart + hours + stringHours + minutes + stringMinutes + seconds + stringSeconds;
}

// Return human readable date string.
function getCurrentDate() {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();

  day < 10 ? day = `0${day}` : null;
  month < 10 ? month = `0${month}` : '';

  return `${month}-${day}-${year}`;
}

function getSystemTime() {
  return Date.now();
}

function createList (array) {
  let list = document.createElement('ul');
  for (var i = 0; i < array.length; i++) {
    const button = document.createElement('button');
    button.addEventListener('click', deleteFromWaitList);
    button.innerHTML = 'Delete';
    button.value = i;
    button.id = 'delete-email-button'
    const item = document.createElement('li');
    item.appendChild(button);
    item.appendChild(document.createTextNode(`${i+1}. ${array[i]}`));
    list.appendChild(item);
  }
  waitListUI.appendChild(list);

  if(waitListUI.children.length != 1) {
    waitListUI.firstChild.remove();
  }
}

/* <<------------------ Calls to Firebase ------------------>> */
function updateIsActive(bool, string, number) {
  db.ref('isActive').set({
    activeUser: string,
    isActive: bool,
    startTime: number
  }, (error) => {
    if (error) {
      console.warn(`error updating FB`);
    } else {
      console.log(`success updating isActive`);
    }
  });
}

function updateWaitList(array) {
  db.ref('waitList').set({
    waitList: array
  }, (error) => {
    if (error) {
      console.warn(`error updating FB waitList`);
    } else {
      console.log(`success updating waitList`);
    }
  });
}

function updateLogs(activeUser, timerString) {
  const dateToday = getCurrentDate();
  const logTime = getSystemTime();

  db.ref(`logs/${dateToday}/${activeUser}-${timerString}`).set({
    user: activeUser,
    timeUsed: timerString,
    logRecoredTime: logTime
  }, (error) => {
    if (error) {
      console.warn(`error writing to FB`);
    } else {
      console.log(`success writing to logs`);
    }
  });
}
