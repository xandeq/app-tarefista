import React, { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Appbar, Snackbar } from "react-native-paper";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import "firebase/compat/firestore";
import firebase from "firebase/compat/app";

interface TaskScreenProps {
  navigation: any;
  route: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ navigation, route }) => {
  const [task, setTask] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const taskToEdit = route.params?.task;

  useEffect(() => {
    if (route.params?.task) {
      setTask(route.params.task.text);
    }
  }, [route.params?.task]);

  const saveTask = async () => {
    if (task.trim() === "") {
      setError("Task description cannot be empty");
      setVisible(true);
      return;
    }
    const timestamp = new Date().toISOString();
    try {
      let response;
      if (taskToEdit) {
        // Edit existing task
        console.log("Timestamp: ", timestamp);
        console.log("Task: ", taskToEdit);
        console.log("taskToEdit.text: ", taskToEdit.text);
        response = await fetch(
          `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskToEdit.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: task,
              completed: taskToEdit.completed,
              createdAt: taskToEdit.createdAt,
              updatedAt: timestamp,
            }),
          }
        );
      } else {
        // add new task
        console.log("Timestamp: ", timestamp);
        console.log("Task: ", task);
        response = await fetch(
          "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: task,
              completed: false,
              createdAt: timestamp,
              updatedAt: timestamp,
            }),
          }
        );
      }

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (response.ok) {
          console.log("Tarefa salva com sucesso: ", data.id);
          navigation.navigate("Home", { taskUpdated: true }); // Sinalizando que uma tarefa foi atualizada
        } else {
          const errorMessage = await response.text();
          console.error("Erro ao salvar tarefa: ", errorMessage);
        }
      } else {
        const errorMessage = await response.text();
        console.error("Erro ao salvar tarefa: ", errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa: ", error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => navigation.goBack()} />
      </Appbar.Header>
      <Animated.View entering={SlideInUp} style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          {taskToEdit ? "Edit Task" : "New Task"}
        </Text>
        <TextInput
          mode="outlined"
          label="Task description"
          style={styles.input}
          value={task}
          onChangeText={setTask}
          theme={{ colors: { primary: "#FF6F61" } }}
        />
        <Button
          mode="contained"
          onPress={saveTask}
          style={styles.button}
          icon={() => (
            <Icon
              name={taskToEdit ? "save" : "add-circle-outline"}
              size={24}
              color="#fff"
            />
          )}
          buttonColor="#FF6F61" // Changed to a color from the logo
        >
          {taskToEdit ? "Save Task" : "Add Task"}
        </Button>
      </Animated.View>
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE5B4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
    color: "#FF6F61", // Changed to a color from the logo
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    paddingVertical: 10,
    borderRadius: 8,
  },
  snackbar: {
    backgroundColor: "#FF6F61",
  },
});

export default TaskScreen;
