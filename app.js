const config = {
  apiKey: "AIzaSyDKw3mLK-1U5YeE9MccAD761q1Jfcs5pWU",
  authDomain: "iaobs-3941b.firebaseapp.com",
  databaseURL: "https://iaobs-3941b.firebaseio.com",
  projectId: "iaobs-3941b",
  storageBucket: "iaobs-3941b.appspot.com",
  messagingSenderId: "981123119987"
};

firebase.initializeApp(config);

// TODO: Create account specific wait-lists

const db = firebase.database();
const stopButton = document.getElementsByClassName('stop-button');
const useButton = document.getElementsByClassName('use-button');
const userEmailInput = document.getElementById('user-email');
const userNameInput = document.getElementsByClassName('user-name-input');
const waitListUI = document.getElementById('wait-list');
const addEmailButton = document.getElementById('add-user-email');
const emailInstructions = document.getElementById('email-instructions');
const appInstructions = document.getElementById('app-instructions');
const appInstructionText = `Enter your name to reserve this account!`;
const emailInstructionText = `Enter your email to be notified when BrowserStack becomes available!`;

let waitList;
let timerStartValue = {};
let dbValues;

/* <<------------------ Event Handler Setup ------------------>> */

for(let i = 0; i < stopButton.length; i++) {
  stopButton[i].addEventListener('click', () => {stopUsingBrowserStack(stopButton[i])});
}

for(let i = 0; i < useButton.length; i++) {
  useButton[i].addEventListener('click', () => {beginUsingBrowserStack(useButton[i])});
}

for(let i = 0; i < userNameInput.length; i++) {
  userNameInput[i].addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
      beginUsingBrowserStack(userNameInput[i]);
    }
  })
}

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

addEmailButton.addEventListener('click', addToWaitList);

/* <<------------------ Init Fires on FB Update ------------------>> */
function init() {
  db.ref(`accounts`).on('value', snap => {
    const accountKeys = Object.keys({...snap.val()});
    dbValues = snap.val();
    if (snap.val()) {
      accountKeys.forEach(function(key) {
        if (dbValues[key].isActive) {
          setActive(key);
        } else {
          setInActive(key);
        }
      })
    } else {
      updateIsActive(false, '', 0, 'qa')
      updateIsActive(false, '', 0, 'evan')
      updateIsActive(false, '', 0, 'justin')
    }
  });

  db.ref('waitList').on('value', snap => {
    if (snap.val()) {
      waitList = snap.val().waitList;
      createList(waitList);
    } else {
      waitList = [];
      createList(waitList);
    }
  });
}

/* <<------------------ User Actions ------------------>> */
function beginUsingBrowserStack(useButton) {
  const key = useButton.id.split(' ')[1];
  startTime = getSystemTime();
  const userNameInput = document.getElementById(`user-name ${key}`).value;
  const appInstructions = document.getElementById(`app-instructions ${key}`);

  if (userNameInput === ``) {
    appInstructions.innerHTML = `Please enter a name!`;
    appInstructions.style.color = 'firebrick'
  } else {
    appInstructions.style.color = ''
    updateIsActive(true, userNameInput, startTime, key);
  }
}

function stopUsingBrowserStack(stopButton) {
  const key = stopButton.id.split(' ')[1];
  const activeTimer = document.getElementById(`active-timer ${key}`);
  const activeUser = dbValues[key].activeUser;
  const formattedString = activeTimer.innerHTML.replace(/&nbsp;/g, ` `);
  delete timerStartValue[key]

  updateLogs(activeUser, formattedString);
  updateIsActive(false, ``, 0, key);
}

function addToWaitList() {
  const emailInput = userEmailInput.value;
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

  if (emailInput.match(emailRegex)) {
    if (waitList.indexOf(emailInput) === -1) {
      waitList.push(userEmailInput.value);
      userEmailInput.value = "";
      emailInstructions.innerHTML = emailInstructionText;
      emailInstructions.style.color = '';
      updateWaitList(waitList);
      createList(waitList);
    } else {
      emailInstructions.innerHTML = `This email is already in the wait list!`;
      emailInstructions.style.color = 'firebrick';
    }
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
function setActive(key) {
  const activeDiv = document.getElementById(`active-status ${key}`);
  const stopButton = document.getElementById(`stop-button ${key}`);
  const useButton = document.getElementById(`use-button ${key}`);
  const activeTimer = document.getElementById(`active-timer ${key}`);
  const userNameInput = document.getElementById(`user-name ${key}`);
  const appInstructions = document.getElementById(`app-instructions ${key}`);
  const activeUser = dbValues[key].activeUser;
  let accountName = key.split('');

  accountName.splice(0,1,accountName[0].toUpperCase())
  accountName = accountName.join('');
  startTime = dbValues[key].startTime

  activeDiv.innerHTML = `${activeUser} is using ${accountName}'s BrowserStack account`;
  activeTimer.style.height = '15px';
  userNameInput.disabled = true;
  userNameInput.value = ``;
  stopButton.disabled = false;
  useButton.disabled = true;
  appInstructions.innerHTML = ``;
  startTimer(startTime, key);
}

function setInActive(key) {
  if (key !== undefined) {
    const stopButton = document.getElementById(`stop-button ${key}`);
    const useButton = document.getElementById(`use-button ${key}`);
    const activeDiv = document.getElementById(`active-status ${key}`);
    const activeTimer = document.getElementById(`active-timer ${key}`);
    const userNameInput = document.getElementById(`user-name ${key}`);
    const appInstructions = document.getElementById(`app-instructions ${key}`);

    activeDiv.innerHTML = `${key}'s BrowserStack account is available!`;
    activeTimer.innerHTML = ``;
    activeTimer.style.height = '';
    appInstructions.innerHTML = appInstructionText;
    stopButton.disabled = true;
    useButton.disabled = false;
    userNameInput.disabled = false;
  }
}

// Init the timer and set the starting value.
function startTimer(startNumber, key) {
  const initTimer = getSystemTime();
  if (!timerStartValue[key]) {
    timerStartValue[key] = {
      isActive: false,
      value: Math.floor((initTimer - startNumber)/1000)
    }
  }

  // If the timer has already been started do not call incrementTimer again
  if (dbValues[key].isActive && !timerStartValue[key].isActive) {
    timerStartValue[key].isActive = true;
    setInterval(incrementTimer, 1000, key);
  }
}

// Add 1 every second to the timer value & display.
function incrementTimer(key) {
  const activeTimer = document.getElementById(`active-timer ${key}`);
  if (timerStartValue[key]) {
    ++timerStartValue[key].value;
    activeTimer.innerHTML = formatTimer(timerStartValue[key].value);
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

// Adds List Items to DOM with delete buttons. Rewrites after update.
function createList (array) {
  let list = document.createElement('ul');
  for (var i = 0; i < array.length; i++) {
    const button = document.createElement('button');
    button.addEventListener('click', deleteFromWaitList);
    button.innerHTML = 'Delete';
    button.value = i;
    button.id = 'delete-email-button'
    const listItem = document.createElement('li');
    listItem.appendChild(button);
    listItem.appendChild(document.createTextNode(`${i+1}. ${array[i]}`));
    list.appendChild(listItem);
  }
  waitListUI.appendChild(list);

  if (waitListUI.children.length != 1) {
    waitListUI.firstChild.remove();
  }
}

/* <<------------------ Calls to Firebase ------------------>> */
function updateIsActive(bool, string, number, id) {
  if (id !== '') {
    db.ref(`accounts/${id}`).set({
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
