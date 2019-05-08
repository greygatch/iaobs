# BrowerStack Tracker App

### Purpose:
To track the use of our Browserstack accounts to assist our team members.

### Setup:
This is a static javascript app that requires no framework or setup. Simply open the index.html in your browser.
To avoid interruption of service please create your own firebase app and enable the realtime database in test mode.
More Reading: [Realtime Database Docs](https://firebase.google.com/docs/database/)
- Create a new app in your firebase project found at console.firebase.google.com/project{YOURFIREBASEPROJECT}/overview and copy the supplied config to app.js config variable.
- Development on our firebase cloud functions can be depolyed to any firebase app with Realtime Database enabled. You will need node 6 or 8, and the Firebase CLI
More Reading: [Getting started with Cloud Functions](https://firebase.google.com/docs/functions/get-started)

Deploy the functions:
- Run firebase login to log in via the browser and authenticate the firebase tool.
```
firebase init
```
- Use the arrow keys and space bar to select functions. Press enter to continue.
- Select a default Firebase project. This is the project that you copied to the config variable in your app.js file.
- Select JavaScript as your language.
- Yes for ESLint (optional)
- No package.json Overwrite
- No index.js Overwrite
- No .gitignore Overwrite
- Yes to install dependencies with npm
```
firebase deploy --only functions
```

###### By E-Vizzle & E-Dizzle