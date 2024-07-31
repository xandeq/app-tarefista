import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import "firebase/analytics";
import "firebase/auth";
import "firebase/compat/firestore";
import firebase from "firebase/compat/app";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import Animated, { SlideInLeft, SlideOutRight } from "react-native-reanimated";

const firebaseConfig = {
  apiKey: "AIzaSyC3tzna3npRAunU6vHulIXTX6-ALOYNMRg",
  authDomain: "tarefista.firebaseapp.com",
  projectId: "tarefista",
  storageBucket: "tarefista.appspot.com",
  messagingSenderId: "104050667822",
  appId: "1:104050667822:web:515935d732fc3aaf228abf",
  measurementId: "G-QJPPMWLBZY",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const TaskItem = ({ task, onRemove, refreshTasks }) => {
  const handleRemove = () => {
    confirmRemove(task.id);
  };

  const confirmRemove = async (taskId) => {
    console.log("onPress: ", taskId);
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      onRemove(taskId);
      refreshTasks();
    } catch (error) {
      console.log("onPress error: ", taskId);
      console.error("Erro ao remover tarefa: ", error);
    }
  };

  const handleComplete = async () => {
    try {
      await updateDoc(doc(db, "tasks", task.id), {
        completed: !task.completed,
      });
      refreshTasks();
    } catch (error) {
      console.error("Erro ao atualizar tarefa: ", error);
    }
  };

  return (
    <Animated.View
      entering={SlideInLeft}
      exiting={SlideOutRight}
      style={[styles.task, task.completed && styles.taskCompleted]}
    >
      <TouchableOpacity onPress={handleComplete} style={styles.taskContent}>
        <Icon
          name={task.completed ? "checkmark-circle" : "ellipse-outline"}
          size={24}
          color={task.completed ? "green" : "gray"}
        />
        <Text
          style={[styles.taskText, task.completed && styles.taskTextCompleted]}
        >
          {task.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRemove}>
        <Icon name="trash" size={24} color="red" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  task: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  taskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCompleted: {
    backgroundColor: "#d4edda",
  },
  taskText: {
    fontSize: 18,
    flex: 1,
    marginLeft: 10,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});

export default TaskItem;
