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
const stopButton = document.getElementsByClassName(`stop-button`);
const useButton = document.getElementsByClassName(`use-button`);
const userEmailInput = document.getElementById(`user-email`);
const accountInput = document.getElementById(`account-select`);
const userNameInput = document.getElementsByClassName(`user-name-input`);
const waitListUI = document.getElementById(`wait-list`);
const addEmailButton = document.getElementById(`add-user-email`);
const emailInstructions = document.getElementById(`email-instructions`);
const appInstructions = document.getElementById(`app-instructions`);

let waitList;
let waitListKeys;
let timerStartValue = {};
let dbValues;
let intervalObject = {};

/* <<------------------ Event Handler Setup ------------------>> */

for(let i = 0; i < stopButton.length; i++) {
  stopButton[i].addEventListener(`click`, () => {stopUsingBrowserStack(stopButton[i])});
}

for(let i = 0; i < useButton.length; i++) {
  useButton[i].addEventListener(`click`, () => {beginUsingBrowserStack(useButton[i])});
}

for(let i = 0; i < userNameInput.length; i++) {
  userNameInput[i].addEventListener(`keyup`, (event) => {
    if (event.keyCode === 13) {
      beginUsingBrowserStack(userNameInput[i]);
    }
  })
}

userEmailInput.addEventListener(`keyup`, (event) => {
  if (event.keyCode === 13) {
    addToWaitList();
  }
});

document.onreadystatechange = () => {
  if (document.readyState === `complete`) {
    init();
  }
}

addEmailButton.addEventListener(`click`, addToWaitList);

/* <<------------------ Init Fires on FB Update ------------------>> */
// Fires on start & each time FB updates one of the watched paths.
// If no data exists set default values in DB.
function init() {
  db.ref(`accounts`).on(`value`, snap => {
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
      updateIsActive(false, ``, 0, `qa`)
      updateIsActive(false, ``, 0, `evan`)
      updateIsActive(false, ``, 0, `justin`)
    }
  });

  db.ref(`waitList`).on(`value`, snap => {
    if (snap.val()) {
      waitList = snap.val().waitList;
      waitListKeys = snap.val().waitListKeys;
      createList(waitList, waitListKeys);
    } else {
      waitList = [];
      waitListKeys = [];
      createList(waitList, waitListKeys);
    }
  });
}

/* <<------------------ User Actions ------------------>> */
function beginUsingBrowserStack(useButton) {
  const key = useButton.id.split(` `)[1];
  const appInstructions = document.getElementById(`app-instructions ${key}`);
  const userNameInput = document.getElementById(`user-name ${key}`).value;

  startTime = getSystemTime();

  if (userNameInput === ``) {
    appInstructions.innerHTML = `Please enter a name!`;
    appInstructions.style.color = `firebrick`
  } else {
    appInstructions.style.color = ``
    updateIsActive(true, userNameInput, startTime, key);
  }
}

function stopUsingBrowserStack(stopButton) {
  const key = stopButton.id.split(` `)[1];
  const activeTimer = document.getElementById(`active-timer ${key}`);
  const activeUser = dbValues[key].activeUser;
  const formattedString = activeTimer.innerHTML.replace(/&nbsp;/g, ` `);

  delete timerStartValue[key];
  updateLogs(activeUser, formattedString);
  updateIsActive(false, ``, 0, key);
}

function addToWaitList() {
  const emailInput = userEmailInput.value;
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

  let accountInputError = ``;
  let emailError = ``;

  // Checks for email legitimacy & accountInput has a value. If both fail, show both error messages.
  if (emailInput.match(emailRegex) && accountInput.value) {
    // Checks if email already exists in the que. If fails show error state.
    if (waitList.indexOf(emailInput) === -1) {
      waitList.push(userEmailInput.value);
      waitListKeys.push(accountInput.value);
      userEmailInput.value = ``;
      accountInput.value = ``;
      emailInstructions.innerHTML = `Enter your email to be notified when BrowserStack becomes available!`;
      emailInstructions.style.color = ``;
      updateWaitList(waitList, waitListKeys);
    } else {
      emailInstructions.innerHTML = `This email is already in the wait list!`;
      emailInstructions.style.color = `firebrick`;
    }
  } else {
    if (!accountInput.value) {
      accountInputError = `Please choose an account to wait for!`;
    }
    if (!emailInput.match(emailRegex)) {
      emailError = `Please enter a valid email!`;
    }
    emailInstructions.innerHTML = `${emailError} ${accountInputError}`;
    emailInstructions.style.color = `firebrick`;
  }
}

// Removes the selected email from dom lists and saves to DB.
function deleteFromWaitList() {
  waitList.splice(this.value, 1);
  waitListKeys.splice(this.value, 1);
  updateWaitList(waitList, waitListKeys);
}

/* <<------------------ App Functions ------------------>> */
// Updates to the DOM should happen in setActive & setInActive to propagate changes for all users.
// Runs each time init is called from the DB updating accounts path for each active tracker.
function setActive(key) {
  const activeDiv = document.getElementById(`active-status ${key}`);
  const activeTimer = document.getElementById(`active-timer ${key}`);
  const activeUser = dbValues[key].activeUser;
  const appInstructions = document.getElementById(`app-instructions ${key}`);
  const stopButton = document.getElementById(`stop-button ${key}`);
  const useButton = document.getElementById(`use-button ${key}`);
  const userNameInput = document.getElementById(`user-name ${key}`);

  let accountName = key.split(``);

  // Sets first letter to Uppercase. Might find a better solution in css.
  accountName.splice(0, 1, accountName[0].toUpperCase())
  accountName = accountName.join(``);
  startTime = dbValues[key].startTime

  activeDiv.innerHTML = `${activeUser} is using ${accountName}'s BrowserStack account`;
  // Sets height to prevent jumping boxes.
  activeTimer.style.height = `15px`;
  appInstructions.innerHTML = ``;
  stopButton.disabled = false;
  useButton.disabled = true;
  userNameInput.disabled = true;
  userNameInput.value = ``;
  startTimer(startTime, key);
}

// Runs each time init is called from the DB updating accounts path for each inactive tracker.
function setInActive(key) {
  if (key !== undefined) {
    const activeDiv = document.getElementById(`active-status ${key}`);
    const activeTimer = document.getElementById(`active-timer ${key}`);
    const appInstructions = document.getElementById(`app-instructions ${key}`);
    const stopButton = document.getElementById(`stop-button ${key}`);
    const useButton = document.getElementById(`use-button ${key}`);
    const userNameInput = document.getElementById(`user-name ${key}`);

    activeDiv.innerHTML = `${key}'s BrowserStack account is available!`;
    // Sets height to prevent jumping boxes.
    activeTimer.style.height = ``;
    activeTimer.innerHTML = ``;
    appInstructions.innerHTML = `Enter your name to reserve this account!`;
    stopButton.disabled = true;
    useButton.disabled = false;
    userNameInput.disabled = false;
    // Clears interval from the active tracker based on unique ID.
    clearInterval(intervalObject[key]);
  }
}

// Init the timer and set the starting value.
function startTimer(startTime, key) {
  const initTime = getSystemTime();

  // If the key does not exist on timerStartValue then create it.
  if (!timerStartValue[key]) {
    timerStartValue[key] = {
      isActive: false,
      value: Math.floor((initTime - startTime)/1000)
    }
  }

  // If the timer has already been started do not call incrementTimer again
  if (dbValues[key].isActive && !timerStartValue[key].isActive) {
    timerStartValue[key].isActive = true;
    // Sets the unique interval id to an object bound by the key. We need this later to clear the interval.
    intervalObject[key] = setInterval(incrementTimer, 1000, key);
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
  const stringStart = `For&nbsp;`;

  let seconds;
  let minutes;
  let hours;
  let stringSeconds = `&nbsp;seconds`;
  let stringMinutes = ``;
  let stringHours = ``;

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
  month < 10 ? month = `0${month}` : ``;

  return `${month}-${day}-${year}`;
}

function getSystemTime() {
  return Date.now();
}

// Draws List Items to DOM with delete buttons. Rewrites after DB update to wait-list.
function createList (array) {
  const list = document.createElement(`ul`);

  if (array) {
    for (var i = 0; i < array.length; i++) {
      const button = document.createElement(`button`);

      button.addEventListener(`click`, deleteFromWaitList);
      button.id = `delete-email-button`
      button.innerHTML = `Delete`;
      button.value = i;

      const listItem = document.createElement(`li`);

      listItem.appendChild(button);
      listItem.appendChild(document.createTextNode(`${i+1}. ${array[i]} for ${waitListKeys[i]}'s account`));
      list.appendChild(listItem);
    }
    waitListUI.appendChild(list);

    // Clears old waitList when createList is called by FB with an updated list.
    if (waitListUI.children.length !== 1) {
      waitListUI.firstChild.remove();
    }
  }
}

/* <<------------------ Calls to Firebase ------------------>> */
function updateIsActive(bool, string, number, id) {
  if (id !== ``) {
    db.ref(`accounts/${id}`).set({
      activeUser: string,
      isActive: bool,
      startTime: number
    }, (error) => {
      if (error) {
        console.warn(`error updating FB accounts`);
      } else {
        console.log(`success updating isActive`);
      }
    });
  }
}

function updateWaitList(array, waitListKeys) {
  db.ref(`waitList`).set({
    waitList: array,
    waitListKeys: waitListKeys
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
  const loggedTime = getSystemTime();
  db.ref(`logs/${dateToday}/${activeUser}-${timerString}`).set({
    user: activeUser,
    timeUsed: timerString,
    loggedTime: loggedTime
  }, (error) => {
    if (error) {
      console.warn(`error writing to FB logs`);
    } else {
      console.log(`success writing to logs`);
    }
  });
}
