// screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import TaskItem from "./TaskItem";
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
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

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

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const taskCollection = await getDocs(collection(db, "tasks"));
    const tasksData = taskCollection.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTasks(tasksData);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRemoveTask = (taskId) => {
    console.log("handleRemoveTask Removing task with id: ", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefista</Text>
      <Animated.View style={[styles.addButton, animatedStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() =>
            navigation.navigate("Task", { refreshTasks: fetchTasks })
          }
        >
          <Icon name="add-circle" size={56} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={tasks}
          style={styles.flatList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onRemove={handleRemoveTask}
              refreshTasks={fetchTasks}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#ff6347",
    borderRadius: 25,
    padding: 10,
    elevation: 5,
    zIndex: 1,
  },
  flatList: {
    width: "100%",
  },
});
