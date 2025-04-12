import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Appbar, IconButton } from "react-native-paper";
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
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";

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

export default function TaskScreen({ navigation, route }) {
  const [task, setTask] = useState("");

  const addTask = async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
  
      if (response.data) {
        console.log("Task added:", response.data);
  
        // Se a API retornar um novo tempUserId, salve no AsyncStorage e recarregue as tarefas
        if (response.data.tempUserId && response.data.tempUserId !== userId) {
          console.log("Novo tempUserId recebido após criação de tarefa:", response.data.tempUserId);
          await saveUserId(response.data.tempUserId);
          await fetchTasks(response.data.tempUserId); // Recarrega as tarefas com o novo ID
        } else {
          await fetchTasks(userId);
        }
      }
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Task" />
      </Appbar.Header>
      <Animated.View entering={SlideInUp} style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>New Task</Text>
        <TextInput
          mode="outlined"
          label="Task description"
          style={styles.input}
          value={task}
          onChangeText={setTask}
          theme={{ colors: { primary: '#0000ff', underlineColor: 'transparent' } }}
        />
        <Button 
          mode="contained" 
          onPress={addTask} 
          style={styles.button}
          icon={() => <Icon name="add-circle-outline" size={24} color="#fff" />}
          buttonColor="#0000ff"
        >
          Add Task
        </Button>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    color: "#0000ff",
    fontSize: 24,
  },
  input: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 8,
  },
  button: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
  },
});
