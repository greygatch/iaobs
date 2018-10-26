var config = {
  apiKey: "AIzaSyCpQx9uI62YWpkoMsnBd3JIo857uDt0OYk",
  authDomain: "testtest123-6376c.firebaseapp.com",
  databaseURL: "https://testtest123-6376c.firebaseio.com",
  projectId: "testtest123-6376c",
  storageBucket: "testtest123-6376c.appspot.com",
  messagingSenderId: "505046414181"
};

firebase.initializeApp(config);
const dbRef = firebase.database().ref();
const activeDiv = document.getElementById('active-status');
const activeTimer = document.getElementById('active-timer');
const useButton = document.getElementById('use-button');
const stopButton = document.getElementById('stop-button');
const userNameInput = document.getElementById('user-name');

let isActive;
let timerStartValue;
let timerIsActive = false;

useButton.addEventListener('click', beginUsingBrowserStack);
stopButton.addEventListener('click', stopUsingBrowserStack);

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    init();
  }
}

function init() {
  dbRef.on('value', snap => {
     isActive = snap.val().isActive;
     const userName = snap.val().userName;
     const startTime = snap.val().startTime;
     if (isActive) {
       activeDiv.innerHTML = `Yes ${userName} has been using it!`;
       useButton.disabled = true;
       stopButton.disabled = false;
       startTimer(startTime);
     } else {
       activeDiv.innerHTML = 'Nope';
       useButton.disabled = false;
       stopButton.disabled = true;
     }
  });
}

function beginUsingBrowserStack() {
  const startTime = Date.now();
  if (userNameInput.value === '') {
    activeDiv.innerHTML = `Please enter a username!`;
  } else {
    updateFirebase(true, userNameInput.value, startTime);
    userNameInput.value = '';
  }
}

function startTimer(startNumber) {
  const initTimer = Date.now();
  timerStartValue = Math.floor((initTimer - startNumber)/1000);
  if (!timerIsActive) {
    setInterval(setTime, 1000);
  }
}

function setTime() {
  let seconds;
  let minutes;
  let hours;

  const start = 'For&nbsp;';
  const stringSeconds = '&nbsp;seconds';
  let stringMinutes = '';
  let stringHour ='';
  let stringHours ='';

  if (isActive) {
    timerIsActive = true;
    ++timerStartValue;
    formatTime(timerStartValue);
    activeTimer.innerHTML = start + hours + stringHours + minutes + stringMinutes + seconds + stringSeconds;
  }

  function formatTime(time) { 
    if (time > 7200) {
      seconds = time % 60;
      minutes = Math.floor((time % 3600)/60);
      hours = Math.floor(time/3600);
      stringMinutes = '&nbsp;minutes&nbsp;and&nbsp;';
      stringHours ='&nbsp;hours&nbsp;and&nbsp;'
    } else if (time > 3600) {
      seconds = time % 60;
      minutes = Math.floor((time % 3600)/60);
      hours = Math.floor(time/3600);
      stringMinutes = '&nbsp;minutes&nbsp;and&nbsp;';
      stringHours ='&nbsp;hour&nbsp;and&nbsp;'
    } else if (time > 60) {
      seconds = (time % 60);
      minutes = Math.floor(time/60);
      hours = '';
      stringMinutes = '&nbsp;minutes&nbsp;and&nbsp;';
    } else {
      seconds = time;
      minutes = '';
      hours = '';
    }
  }
}


function stopUsingBrowserStack() {
  userNameInput.value = '';
  activeTimer.innerHTML = '';
  updateFirebase(false, '', 0);
}

function updateFirebase(bool, string, number) {
  dbRef.set({
    userName: string,
    isActive: bool,
    startTime: number
  }, (error) => {
    if (error) {
      console.log('error writing to FB');
    } else {
      console.log('success updating isActive');
    }
  });
}
