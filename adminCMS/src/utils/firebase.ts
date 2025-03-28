import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, getDownloadURL, updateMetadata } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB00s1AAWCcODQKBRL2Q30lE9-x3MBQTis',
  authDomain: 'cressey-3d9ca.firebaseapp.com',
  projectId: 'cressey-3d9ca',
  storageBucket: 'cressey-3d9ca.appspot.com',
  messagingSenderId: '695440676123',
  appId: '1:695440676123:web:fc868041cd810e7af5afbe',
  measurementId: 'G-1JD1QCZ7VS',
};

export const firebaseapp = initializeApp(firebaseConfig);
export const storage = getStorage();
export const auth = getAuth();
export const db_firestore = getFirestore();

export const firebaseErrorString = (error: FirebaseError) => {
  const res = { message: '' };
  res.message = error.message;
  const errorCode = error.code;
  if (errorCode === 'auth/too-many-requests') {
    res.message = 'Too many requests. Try again later.';
  } else if (errorCode === 'auth/invalid-credential') {
    res.message = 'Invalid credentials.';
  } else if (errorCode == 'auth/weak-password') {
    res.message = 'The password is too weak. Try another password.';
  } else if (errorCode == 'auth/email-already-in-use') {
    res.message = 'Duplicated email.';
  } else if (errorCode == 'auth/invalid-email') {
    res.message = 'Invalid email.';
  } else if (errorCode == 'auth/user-not-found') {
    res.message = 'User not found.';
  }
  return res;
};

export const getFirebaseImage = async (location: string) => {
  try {
    const ImageRef = ref(storage, location);
    await updateMetadata(ImageRef, {
      customMetadata: {
        cacheControl: 'public, max-age=300',
      },
    });
    const ImageURL = await getDownloadURL(ImageRef);
    return await ImageURL;
  } catch (e) {
    console.log(e);
    return '';
  }
}

export const getToken = async () => {
  if(auth && auth.currentUser)
  {
    const token = await auth.currentUser.getIdToken();
    return token;
  }
  return undefined;
}
