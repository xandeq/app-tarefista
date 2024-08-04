import firebase from "firebase/compat/app";

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    createdAt: firebase.firestore.Timestamp;
    updatedAt: firebase.firestore.Timestamp;
  }
  