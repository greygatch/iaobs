var config = {
  apiKey: "AIzaSyDKw3mLK-1U5YeE9MccAD761q1Jfcs5pWU",
  authDomain: "iaobs-3941b.firebaseapp.com",
  databaseURL: "https://iaobs-3941b.firebaseio.com",
  projectId: "iaobs-3941b",
  storageBucket: "iaobs-3941b.appspot.com",
  messagingSenderId: "981123119987"
};

firebase.initializeApp(config);
const dbRef = firebase.database().ref(),
      activeDiv = document.getElementById('active-status'),
      useButton = document.getElementById('use-button'),
      stopButton = document.getElementById('stop-button'),
      userNameInput = document.getElementById('user-name');

useButton.addEventListener('click', beginUsingBrowserStack);
stopButton.addEventListener('click', stopUsingBrowserStack);

init();

function init() {
  dbRef.on('value', snap => {
     const isActive = snap.val().isActive,
           userName = snap.val().userName;
     if (isActive) {
       activeDiv.innerHTML = `Yes ${userName} is busy with it!`;
       useButton.disabled = true;
       stopButton.disabled = false;
     } else {  
       activeDiv.innerHTML = 'Nope';
       useButton.disabled = false;
       stopButton.disabled = true;
     }
  });
}

function beginUsingBrowserStack() {
  if (userNameInput.value === '') {
    activeDiv.innerHTML = `Please enter a username!`;
  } else {
    updateActiveStatus(true, userNameInput.value);
    userNameInput.value = '';
  }
}

function stopUsingBrowserStack() {
  userNameInput.value = '';
  updateActiveStatus(false, '');
}

function updateActiveStatus(bool, string) {
  dbRef.set({
    userName: string,
    isActive: bool
  }, (error) => {
    if (error) {
      console.log('error writing to FB');
    } else {
      console.log('success updating isActive');
    }
  });
}
