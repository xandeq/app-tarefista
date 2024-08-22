import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Appbar, Snackbar } from "react-native-paper";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import "firebase/compat/firestore";
import { getTaskCount, incrementTaskCount } from "../utils/taskTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    if (!taskToEdit) {
      // Check if user is unregistered and limit exceeded
      let taskCount = await getTaskCount();
      if (taskCount >= 10) {
        Alert.alert(
          "Limite Atingido",
          "Você pode adicionar apenas 10 tarefas por dia."
        );
        return;
      }
    }
    let tempUserId = await AsyncStorage.getItem("tempUserId");
    let timestamp = new Date().toISOString();
    try {
      let response;
      if (taskToEdit) {
        // Edit existing task
        console.log("Timestamp: ", timestamp);
        console.log("Task 1: ", taskToEdit);
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
              tempUserId: tempUserId,
            }),
          }
        );
      } else {
        // add new task
        console.log("Timestamp: ", timestamp);
        console.log("Task 2: ", task);
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
              tempUserId: tempUserId,
            }),
          }
        );
      }
      console.log("Response Status:", response.status);
      console.log("Response Headers:", response.headers);

      // Verificar o tipo de resposta
      const contentType = response.headers.get("content-type");
      let responseData;
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
        console.log("Dados JSON:", responseData);
      } else {
        responseData = await response.text();
        console.log("Texto da resposta:", responseData);
      }

      if (response.ok) {
        if (!tempUserId && responseData && responseData.tempUserId) {
          await AsyncStorage.setItem("tempUserId", responseData.tempUserId);
        }
        navigation.navigate("Inicio", { taskUpdated: true });
      } else {
        console.error("Erro ao salvar tarefa:", responseData);
      }
    } catch (error: any) {
      // Verifica se o erro é uma instância de Error, TypeError ou se é um erro de rede
      if (error instanceof TypeError) {
        console.error("Erro de tipo ao salvar tarefa:", error.message);
        console.error("Stack Trace:", error.stack);
      } else if (error instanceof SyntaxError) {
        console.error("Erro de sintaxe ao salvar tarefa:", error.message);
        console.error("Stack Trace:", error.stack);
      } else if (error.message.includes("NetworkError")) {
        console.error("Erro de rede ao salvar tarefa:", error.message);
        console.error("Verifique sua conexão com a internet.");
      } else {
        console.error("Erro desconhecido ao salvar tarefa:", error.message);
        console.error("Stack Trace:", error.stack);
      }

      // Exibe detalhes adicionais se disponíveis
      console.error(
        "Erro ao salvar tarefa completo:",
        JSON.stringify(error, null, 2)
      );
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
        <Text variant="headlineLarge" style={styles.title}>
          {taskToEdit ? "Edit Tarefa" : "Nova Tarefa"}
        </Text>
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
          buttonColor="#FF6F61" // Changed to a color from the logo
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
