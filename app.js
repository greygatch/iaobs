var config = {
  apiKey: "AIzaSyDKw3mLK-1U5YeE9MccAD761q1Jfcs5pWU",
  authDomain: "iaobs-3941b.firebaseapp.com",
  databaseURL: "https://iaobs-3941b.firebaseio.com",
  projectId: "iaobs-3941b",
  storageBucket: "iaobs-3941b.appspot.com",
  messagingSenderId: "981123119987"
};

firebase.initializeApp(config);
const dbRef = firebase.database().ref();
const activeDiv = document.getElementById('active-status');
const useButton = document.getElementById('use-button');
const stopButton = document.getElementById('stop-button');

useButton.addEventListener('click', beginUsingBrowserStack);
stopButton.addEventListener('click', stopUsingBrowserStack);

init();

function init() {
  dbRef.on('value', snap => {
     const isActive = snap.val().isActive;
     if (isActive) {
       activeDiv.innerHTML = 'Yes';
       useButton.disabled = true;
       stopButton.disabled = false;
     } else {
       activeDiv.innerHTML = 'No';
       useButton.disabled = false;
       stopButton.disabled = true;
     }
  });
}

function beginUsingBrowserStack() {
  updateActiveStatus(true);
}

function stopUsingBrowserStack() {
  updateActiveStatus(false);
}

function updateActiveStatus(bool) {
  dbRef.set({
    isActive: bool
  }, (error) => {
    if (error) {
      console.log('error writing to FB');
    } else {
      console.log('success updating isActive');
    }
  });
}
