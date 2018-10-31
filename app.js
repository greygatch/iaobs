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

let activeUser;
let isActive;
let startTime;
let timerStartValue;
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
    activeUser = snap.val().activeUser;
    isActive = snap.val().isActive;
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
    activeDiv.innerHTML = `Please enter a name!`;
  } else {
    updateFirebaseIsActive(true, userNameInput.value, startTime);
    userNameInput.value = ``;
  }
}

function stopUsingBrowserStack() {
  const formmatedString = activeTimer.innerHTML.replace(/&nbsp;/g, ` `);

  updateFirebaseLogs(activeUser, formmatedString);
  updateFirebaseIsActive(false, ``, 0);
}

/* <<------------------ App Functions ------------------>> */
function setActive() {
  activeDiv.innerHTML = `${activeUser} has been using BrowserStack`;
  stopButton.disabled = false;
  useButton.disabled = true;
  userNameInput.disabled = true;
  startTimer(startTime);
}

function setInActive() {
  activeDiv.innerHTML = `No one is currently using BrowserStack`;
  activeTimer.innerHTML = ``;
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

  const stringSeconds = `&nbsp;seconds`;
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
  }

  return stringStart + hours + stringHours + minutes + stringMinutes + seconds + stringSeconds;
}

// Return human readable date string.
function getCurrentDate() {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth()+1;
  const year = date.getFullYear();

  day < 10 ? day = `0${day}` : null;
  month < 10 ? month = `0${month}` : '';

  return `${month}-${day}-${year}`;
}

function getSystemTime() {
  return Date.now();
}

/* <<------------------ Calls to Firebase ------------------>> */
function updateFirebaseIsActive(bool, string, number) {
  db.ref('isActive').set({
    activeUser: string,
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

function updateFirebaseLogs(activeUser, timerString) {
  const dateToday = getCurrentDate();
  const logTime = getSystemTime();

  db.ref(`logs/${dateToday}/${activeUser}-${timerString}`).set({
    user: activeUser,
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
