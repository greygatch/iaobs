const config = {
  apiKey: "AIzaSyCpQx9uI62YWpkoMsnBd3JIo857uDt0OYk",
  authDomain: "testtest123-6376c.firebaseapp.com",
  databaseURL: "https://testtest123-6376c.firebaseio.com",
  projectId: "testtest123-6376c",
  storageBucket: "testtest123-6376c.appspot.com",
  messagingSenderId: "505046414181"
};

firebase.initializeApp(config);

const db = firebase.database();
const activeDiv = document.getElementById('active-status');
const activeTimer = document.getElementById('active-timer');
const useButton = document.getElementById('use-button');
const stopButton = document.getElementById('stop-button');
const userNameInput = document.getElementById('user-name');

let isActive;
let userName;
let startTime;
let timerStartValue;
let activeUser;
let timerIsActive = false;

stopButton.addEventListener('click', stopUsingBrowserStack);
useButton.addEventListener('click', beginUsingBrowserStack);
userNameInput.addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    beginUsingBrowserStack();
  }
});

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    init();
  }
}

function init() {
  db.ref('isActive').on('value', snap => {
    isActive = snap.val().isActive;
    userName = snap.val().userName;
    startTime = snap.val().startTime;
    if (isActive) {
      setActive();
    } else {
      setInActive();
    }
  });
}

/* <<------------------ User Actions ------------------>> */
function beginUsingBrowserStack() {
  startTime = getSystemTime();

  if (userNameInput.value === ``) {
    activeDiv.innerHTML = `Please enter a username!`;
  } else {
    updateFirebaseIsActive(true, userNameInput.value, startTime);
    userNameInput.value = ``;
  }
}

function stopUsingBrowserStack() {
  const formmatedString = activeTimer.innerHTML.replace(/&nbsp;/g, ` `);
  updateFirebaseLogs(activeUser, formmatedString);
  activeTimer.innerHTML = ``;
  updateFirebaseIsActive(false, ``, 0);
}

/* <<------------------ App Functions ------------------>> */
function setActive() {
  activeUser = userName;
  activeDiv.innerHTML = `${userName} has been using BrowserStack`;
  useButton.disabled = true;
  stopButton.disabled = false;
  userNameInput.disabled = true;
  startTimer(startTime);
}

function setInActive() {
  activeDiv.innerHTML = `No one is currently using BrowserStack`;
  activeTimer.innerHTML = ``;
  useButton.disabled = false;
  stopButton.disabled = true;
  userNameInput.disabled = false;
}

function startTimer(startNumber) {
  const initTimer = getSystemTime();
  timerStartValue = Math.floor((initTimer - startNumber)/1000);
  if (!timerIsActive) {
    setInterval(incrementTimer, 1000);
  }
}

function incrementTimer() {
  if (isActive) {
    timerIsActive = true;
    ++timerStartValue;
    activeTimer.innerHTML = formatTime(timerStartValue);
  }
}

// Format time to readable string.
function formatTime(time) {
  let seconds;
  let hours;
  let minutes;
  let stringMinutes = ``;
  let stringHours = ``;

  const stringStart = `For&nbsp;`;
  const stringSeconds = `&nbsp;seconds`;

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
  }
  return stringStart + hours + stringHours + minutes + stringMinutes + seconds + stringSeconds;
}

// Return human readable date string.
function getCurrentDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth()+1;
  const year = date.getFullYear();

  if (day < 10) {
    day = `0${day}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  return `${month}-${day}-${year}`;
}

function getSystemTime() {
  return Date.now();
}

/* <<------------------ Calls to Firebase ------------------>> */
function updateFirebaseIsActive(bool, string, number) {
  db.ref('isActive').set({
    userName: string,
    isActive: bool,
    startTime: number
  }, (error) => {
    if (error) {
      console.log(`error writing to FB`);
    } else {
      console.log(`success updating isActive`);
    }
  });
}

function updateFirebaseLogs(userName, timerString) {
  const logTime = getSystemTime();
  const dateToday = getCurrentDate();

  db.ref(`logs/${dateToday}/${userName}-${timerString}`).set({
    user: userName,
    timeUsed: timerString,
    logRecoredTime: logTime
  }, (error) => {
    if (error) {
      console.log(`error writing to FB`);
    } else {
      console.log(`success updating logs`);
    }
  });
}
