import Artwork from './Artwork';
import firebase from 'firebase';
import Layout from './Layout';
import 'firebase/firestore';

const APP = window.APP || {};

const initFirebase = () => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_KEY,
    authDomain: 'nowhere-web.firebaseapp.com',
    databaseURL: 'https://nowhere-web.firebaseio.com',
    projectId: 'nowhere-web',
    storageBucket: 'nowhere-web.appspot.com',
    messagingSenderId: '959660492119',
    appId: '1:959660492119:web:fd45e239c1ab467d66aa12',
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
};

const loadData = async (callback) => {
  const db = firebase.firestore();
  const result = await db.collection('spotify').get();
  const tracks = result.docs.map((doc) => {
    return {
      id: doc.data().id,
      name: doc.data().name,
      image: doc.data().img,
      date: doc.data().date,
    };
  });
  callback(tracks);
};

const init = () => {
  window.APP = APP;
  initFirebase();
  loadData((tracks) => {
    APP.Layout = new Layout();
    new Artwork(tracks);
  });
};

if (
  document.readyState === 'complete' ||
  (document.readyState !== 'loading' && !document.documentElement.doScroll)
) {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
