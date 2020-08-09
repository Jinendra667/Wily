import firebase from 'firebase';
require('@firebase/firestore')
 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyBpYIyqmEi2PWbE_LuYBpv8-gGZHsNEubg",
    authDomain: "wily-bb92e.firebaseapp.com",
    databaseURL: "https://wily-bb92e.firebaseio.com",
    projectId: "wily-bb92e",
    storageBucket: "wily-bb92e.appspot.com",
    messagingSenderId: "986570907067",
    appId: "1:986570907067:web:3ea1ca8bdf12b4889d389e"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()