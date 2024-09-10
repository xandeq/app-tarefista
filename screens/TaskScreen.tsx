import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
} from "react-native";
import { Text, TextInput, Button, Appbar, Snackbar } from "react-native-paper";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import "firebase/compat/firestore";
import firebase from "firebase/compat/app";
import { getTaskCount, incrementTaskCount } from "../utils/taskTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { Task } from "../models/Task"; // Importando o modelo Task

interface TaskScreenProps {
  navigation: any;
  route: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ navigation, route }) => {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const taskToEdit: Task = route.params?.task;

  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.text);
    }
  }, [taskToEdit]);

  const saveTask = async () => {
    if (task.trim() === "") {
      setError("Task description cannot be empty");
      setVisible(true);
      return;
    }

    if (!taskToEdit) {
      // Check if user is unregistered and limit exceeded
      const taskCount = await getTaskCount();
      if (taskCount >= 10) {
        Alert.alert(
          "Limite Atingido",
          "Você pode adicionar apenas 10 tarefas por dia."
        );
        return;
      }
    }

    const tempUserId = await AsyncStorage.getItem("tempUserId");
    const timestamp = new Date().toISOString();

    const taskPayload: Task = {
      text: task,
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt || timestamp,
      updatedAt: timestamp,
      tempUserId: tempUserId ?? "",
    };

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
            body: JSON.stringify(taskPayload),
          }
        );
      } else {
        console.log("taskPayload: ", taskPayload);
        // Add new task
        response = await fetch(
          "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(taskPayload),
          }
        );
      }

      if (response.ok) {
        console.log("response: ", response);
        const data = await response.json();

        if (!tempUserId && data.tempUserId) {
          await AsyncStorage.setItem("tempUserId", data.tempUserId);
        }

        await incrementTaskCount();
        navigation.navigate("Home", { taskUpdated: true }); // Sinalizando que uma tarefa foi atualizada
      } else {
        const errorMessage = await response.text();
        console.error("Erro ao salvar tarefa 1: ", errorMessage);
      }
    } catch (error) {
      console.error("Erro ao salvar tarefa 3: ", error);
    }
  };

  const deleteTask = async () => {
    try {
      const response = await fetch(
        `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskToEdit.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        if (typeof route.params?.refreshTasks === "function") {
          route.params.refreshTasks();
        }
        navigation.goBack();
      } else {
        console.error("Erro ao deletar tarefa: ", await response.text());
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa: ", error);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Confirmação",
      "Você tem certeza que deseja deletar esta tarefa?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", style: "destructive", onPress: deleteTask },
      ],
      { cancelable: true }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Appbar.Header>
        <Appbar.Action icon="close" onPress={() => navigation.goBack()} />
        {taskToEdit && (
          <Appbar.Action icon="trash-can" onPress={confirmDelete} color="red" />
        )}
      </Appbar.Header>

      <Animated.View entering={SlideInUp} style={styles.content}>
        <View style={styles.titleContainer}>
          <LottieView
            source={require("../assets/cleaning.json")}
            autoPlay
            loop
            style={styles.iconAnimation}
          />
          <Text variant="headlineLarge" style={styles.title}>
            Nova Tarefa
          </Text>
        </View>
        <TextInput
          mode="outlined"
          label="Descrição da tarefa"
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
          buttonColor="#FF6F61"
        >
          {taskToEdit ? "Salvar" : "Adicionar"}
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
    color: "#FF6F61", 
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
  lottie: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconAnimation: {
    width: 48,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  }
});

export default TaskScreen;
