import React, { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Appbar } from "react-native-paper";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";

interface TaskScreenProps {
  navigation: any;
  route: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ navigation, route }) => {
  const [task, setTask] = useState<string>("");
  const taskToEdit = route.params?.task;

  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.text);
    }
  }, [taskToEdit]);

  const saveTask = async () => {
    if (task.trim() === "") {
      alert("Task cannot be empty");
      return;
    }
    try {
      let response;
      if (taskToEdit) {
        // Edit existing task
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
            }),
          }
        );
      } else {
        // Add new task
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
            }),
          }
        );
      }

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data) {
          console.log("Tarefa salva com sucesso: ", data.id);
        } else {
          console.log("Tarefa salva com sucesso, mas a resposta não era JSON.");
        }
        if (route.params?.refreshTasks) {
          route.params.refreshTasks();
        }
        navigation.goBack();
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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={taskToEdit ? "Edit Task" : "Add Task"} />
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
          theme={{ colors: { primary: "#0000ff" } }}
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
          buttonColor="#0000ff"
        >
          {taskToEdit ? "Save Task" : "Add Task"}
        </Button>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

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

export default TaskScreen;
