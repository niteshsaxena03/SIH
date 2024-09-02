// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSCTnw7Dzg-LFeOeKFTTqho44tekekwys",
  authDomain: "jeevan-rakshak-ebf1e.firebaseapp.com",
  projectId: "jeevan-rakshak-ebf1e",
  storageBucket: "jeevan-rakshak-ebf1e.appspot.com",
  messagingSenderId: "288646149383",
  appId: "1:288646149383:web:a8be512db804b3035401a2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context for Firebase
const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });

    return () => unsubscribe();
  }, []);

  const signUpUserWithEmailAndPassword = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginUserWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    return signOut(auth);
  };
  const addUserData = async (userId, userData) => {
    try {
      await setDoc(doc(db, "users", userId), userData);
    } catch (error) {
      console.error("Error adding user data: ", error);
    }
  };
  const deleteUserData = async (userId) => {
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      console.error("Error deleting user data: ", error);
    }
  };
   const addContactToUser = async (userId, newContact) => {
     try {
       const userRef = doc(db, "users", userId);
       await updateDoc(userRef, {
         emergencyContacts: arrayUnion({ contact: newContact }),
       });
     } catch (error) {
       console.error("Error adding contact:", error);
     }
   };

   const removeContactFromUser = async (userId, contactToRemove) => {
     try {
       const userRef = doc(db, "users", userId);
       const userDoc = await getDoc(userRef);
       const userData = userDoc.data();
       const updatedContacts = userData.emergencyContacts.filter(
         (contact) => contact.contact !== contactToRemove
       );
       await updateDoc(userRef, {
         emergencyContacts: updatedContacts,
       });
     } catch (error) {
       console.error("Error removing contact:", error);
     }
   };
  const getUserDetailsByEmail = async (email) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData;
      } else {
        console.warn("No matching documents.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
      return null;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        signUpUserWithEmailAndPassword,
        loginUserWithEmailAndPassword,
        logOut,
        addUserData,
        getUserDetailsByEmail,
        deleteUserData,
        addContactToUser,
        removeContactFromUser,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

// Export instances for use in your app
export { db, auth, storage };
