// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyAAXEYWOSqakF11IC8cwtXjtdvuEQyYrUw',
    authDomain: 'angularfire2-fcb1d.firebaseapp.com',
    databaseURL: 'https://angularfire2-fcb1d-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'angularfire2-fcb1d',
    storageBucket: 'angularfire2-fcb1d.appspot.com',
    messagingSenderId: '238934934577',
    appId: '1:238934934577:web:1d5a2bc5168d80fdcb0110'
  },
  configuration: {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
    iceCandidatePoolSize: 5,
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
