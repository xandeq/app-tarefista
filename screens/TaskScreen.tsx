import React, { useEffect, useState } from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, Alert, View } from "react-native";
import { Text, TextInput, Button, Appbar, Snackbar, Checkbox, Menu } from "react-native-paper";
import Animated, { SlideInUp } from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import { getTaskCount, incrementTaskCount } from "../utils/taskTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { Task } from "../models/Task"; // Importando o modelo Task
import DateTimePicker from "@react-native-community/datetimepicker";

const recurrenceOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Custom", value: "custom" },
];

interface TaskScreenProps {
  navigation: any;
  route: any;
}

const TaskScreen: React.FC<TaskScreenProps> = ({ navigation, route }) => {
  const [task, setTask] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [recurrencePattern, setRecurrencePattern] = useState<string>("daily"); // Default to daily
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const taskToEdit: Task = route.params?.task;

  const calculatedEndDate = endDate ? endDate : new Date(new Date().setFullYear(new Date().getFullYear() + 5));

  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.text);
      setIsRecurring(taskToEdit.isRecurring || false);
      setRecurrencePattern(taskToEdit.recurrencePattern || "daily");
      if (taskToEdit.startDate) {
        const parsedStartDate = new Date(taskToEdit.startDate);
        setStartDate(isNaN(parsedStartDate.getTime()) ? new Date() : parsedStartDate);
      } else {
        setStartDate(new Date());
      }

      // Verifica e converte endDate para Date
      if (taskToEdit.endDate) {
        const parsedEndDate = new Date(taskToEdit.endDate);
        setEndDate(isNaN(parsedEndDate.getTime()) ? undefined : parsedEndDate);
      } else {
        setEndDate(undefined);
      }
    }
  }, [taskToEdit]);

  const showStartPicker = () => {
    setShowStartDatePicker(true);
  };

  const showEndPicker = () => {
    setShowEndDatePicker(true);
  };

  const saveTask = async () => {
    console.log("taskToEdit: ", taskToEdit);
    if (task.trim() === "") {
      setError("Task description cannot be empty");
      setVisible(true);
      return;
    }

    const tempUserId = await AsyncStorage.getItem("tempUserId");
    const timestamp = new Date().toISOString();

    const taskPayload: Task = {
      userId: taskToEdit?.userId || "",
      text: task || "",
      completed: taskToEdit?.completed || false,
      createdAt: taskToEdit?.createdAt ?? new Date().toISOString(), // Substitui null por uma data atual
      updatedAt: new Date().toISOString(),
      tempUserId: tempUserId ?? "",
      isRecurring: isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : "",
      startDate: isRecurring ? (startDate ? startDate.toISOString() : "") : "", // Substitui null por string vazia
      endDate: isRecurring ? (endDate ? endDate.toISOString() : "") : "", // Substitui null por string vazia
    };
    

    (Object.keys(taskPayload) as (keyof Task)[]).forEach((key) => taskPayload[key] === undefined && delete taskPayload[key]);
    console.log("taskPayload: ", taskPayload);
    try {
      let response;
      if (taskToEdit) {
        // Edit existing task
        response = await fetch(`https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskToEdit.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskPayload),
        });
      } else {
        console.log("taskPayload: ", taskPayload);
        // Add new task
        response = await fetch("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskPayload),
        });
      }

      if (response.ok) {
        const contentType = response.headers.get("content-type");

        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
          // Resposta é JSON
          data = await response.json();
        } else {
          // Resposta é texto
          data = await response.text();
        }

        console.log("response: ", data);

        if (!tempUserId && data.tempUserId) {
          await AsyncStorage.setItem("tempUserId", data.tempUserId);
        }

        await incrementTaskCount();
        navigation.navigate("Home", { taskUpdated: true });
      } else {
        const errorMessage = await response.text();
        console.error("Erro ao salvar tarefa 1: ", errorMessage);
      }
    } catch (error) {
      // Verifica se o erro tem uma mensagem, código ou um stack trace
      if (error instanceof Error) {
        console.error("Erro ao salvar tarefa 3: ");
        console.error("Mensagem do erro:", error.message);
        console.error("Stack trace:", error.stack);
      } else {
        // Caso o erro seja de outro tipo (por exemplo, um objeto ou string)
        console.error("Erro inesperado ao salvar tarefa 3:", error);
      }
    }
  };

  const deleteTask = async () => {
    try {
      const response = await fetch(`https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskToEdit.id}`, {
        method: "DELETE",
      });
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
      { cancelable: true },
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Appbar.Header>
        <Appbar.Action
          icon='close'
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("HomeTab"); // Ou navegue para uma tela inicial
            }
          }}
        />

        {taskToEdit && <Appbar.Action icon='trash-can' onPress={confirmDelete} color='red' />}
      </Appbar.Header>

      <Animated.View entering={SlideInUp} style={styles.content}>
        <View style={styles.titleContainer}>
          <LottieView source={require("../assets/cleaning.json")} autoPlay loop style={styles.iconAnimation} />
          <Text variant='headlineLarge' style={styles.title}>
            Nova Tarefa
          </Text>
        </View>
        <TextInput mode='outlined' label='Descrição da tarefa' style={styles.input} value={task} onChangeText={setTask} theme={{ colors: { primary: "#FF6F61" } }} />
        {/* Recurring Task Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox status={isRecurring ? "checked" : "unchecked"} onPress={() => setIsRecurring(!isRecurring)} />
          <Text>Recorrente ?</Text>
        </View>
        {/* Recurrence Pattern Dropdown */}
        {isRecurring && (
          <Menu visible={menuVisible} onDismiss={() => setMenuVisible(false)} anchor={<Button onPress={() => {}}>Repeat: {recurrencePattern}</Button>}>
            {recurrenceOptions.map((option) => (
              <Menu.Item key={option.value} onPress={() => setRecurrencePattern(option.value)} title={option.label} />
            ))}
          </Menu>
        )}
        {/* Start Date Picker */}
        <Button onPress={showStartPicker}>Inicio: {startDate.toDateString()}</Button>
        {showStartDatePicker && (
          <DateTimePicker
            mode='date'
            value={startDate || new Date()} // Garantir que sempre passe uma data válida
            onChange={(event: any, selectedDate: any) => {
              setShowStartDatePicker(false);
              setStartDate(selectedDate || new Date()); // Atualiza com uma data válida
            }}
          />
        )}

        {/* End Date Picker */}
        {isRecurring && (
          <>
            <Button onPress={showEndPicker}>Fim: {endDate ? endDate.toDateString() : "Not Set"}</Button>
            {showEndDatePicker && (
              <DateTimePicker
                mode='date'
                value={endDate || new Date()} // Garantir que sempre passe uma data válida
                onChange={(event: any, selectedDate: any) => {
                  setShowEndDatePicker(false);
                  setEndDate(selectedDate || undefined);
                }}
              />
            )}
          </>
        )}

        <Button mode='contained' onPress={saveTask} style={styles.button} icon={() => <Icon name={taskToEdit ? "save" : "add-circle-outline"} size={24} color='#fff' />} buttonColor='#FF6F61'>
          {taskToEdit ? "Salvar" : "Adicionar"}
        </Button>
      </Animated.View>
      <Snackbar visible={visible} onDismiss={() => setVisible(false)} duration={3000} style={styles.snackbar}>
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconAnimation: {
    width: 48,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
});

export default TaskScreen;
