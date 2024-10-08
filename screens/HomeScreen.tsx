import React, { useState, useEffect } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Text, Alert } from "react-native";
import TaskItem from "./TaskItem";
import Icon from "react-native-vector-icons/Ionicons";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import LottieView from "lottie-react-native";
import moment from "moment";
import { Task } from "../models/Task";

interface HomeScreenProps {
  navigation: any;
  route: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null); // Declare the 'userId' variable
  const [quote, setQuote] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Função para buscar as tarefas do usuário
  const fetchTasks = async (userId: string) => {
    try {
      let token = await AsyncStorage.getItem("authToken");

      if (!token) {
        console.log("Token fetchTasks is null, using tempUserId instead");
        token = await AsyncStorage.getItem("tempUserId");
      }

      if (!token) {
        console.error("No authToken or tempUserId found, cannot fetch tasks");
        return;
      }

      console.log("Token fetchTasks:", token);

      const response = await axios.get("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks", {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
        params: { tempUserId: userId }, // Pass the userId or tempUserId here
      });

      if (response.data) {
        console.log("Tasks fetched:", response.data);
        setTasks(response.data);
      } else {
        console.error("Error fetching tasks:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    try {
      const response = await axios.get("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/phrases");
      const { phrase } = response.data; // A API retorna um objeto com a chave 'phrase'
      return phrase;
    } catch (error) {
      console.error("Error fetching phrase: ", error);
      return "Erro ao buscar frase";
    }
  };

  const saveTasks = async (updatedTasks: any[]) => {
    try {
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  // Função para obter o userId do AsyncStorage ou da API
  const fetchUserId = async () => {
    try {
      console.log("fetchUserId HOME");
      // Primeiro, verifique se o userId já está no AsyncStorage
      let storedUserId = await AsyncStorage.getItem("tempUserId");
      if (storedUserId) {
        console.log("User ID found in AsyncStorage:", storedUserId);
        setUserId(storedUserId);
        return storedUserId;
      }

      // Se o userId não estiver armazenado, busque o authToken
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No authToken found in AsyncStorage");
        return null;
      }
      console.log("Token fetchUserId:", token);

      // Faça a chamada à API para obter o userId
      const response = await fetch("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/userId", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User ID from API:", data.userId);

        // Armazene o userId no AsyncStorage para uso futuro
        await AsyncStorage.setItem("tempUserId", data.userId);
        setUserId(data.userId);
        return data.userId;
      } else {
        console.error("Error fetching user ID:", await response.text());
        return null;
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  // useEffect para carregar o userId e as tarefas ao montar o componente
  useEffect(() => {
    console.log("useEffect HomeScreen");
    const loadUserIdAndTasks = async () => {
      const fetchedUserId = await fetchUserId();
      console.log("fetchedUserId:", fetchedUserId);
      if (fetchedUserId) {
        await fetchTasks(fetchedUserId);
      } else {
        setLoading(false); // Garantir que o loading pare mesmo que o userId não seja encontrado
      }
      const fetchedQuote = await fetchQuote();
      setQuote(fetchedQuote);
    };

    loadUserIdAndTasks();

    const unsubscribe = navigation.addListener("focus", () => {
      if (userId) {
        fetchTasks(userId); // Chama fetchTasks com o userId do estado
      }
    });

    return unsubscribe;
  }, [navigation, userId, route.params?.taskUpdated]); // Certifique-se que taskUpdated é monitorado

  useEffect(() => {
    setFilteredTasks(filterTasksByDate(tasks, selectedDate));
  }, [selectedDate, tasks]); // Monitorar selectedDate e tasks

  // Certifique-se que taskUpdated é monitorado
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

  const handleEditTask = (task: any) => {
    navigation.navigate("Tasks", { task: task });
  };

  const handleRemoveTask = (taskId: string) => {
    console.log("handleRemoveTask Removing task with id: ", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const renderDays = () => {
    const today = moment(); // Dia atual
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = moment().add(i, "days");
      const isToday = day.isSame(today, "day"); // Verifica se é o dia atual
      days.push({
        dayNumber: day.format("DD"),
        dayName: day.format("ddd").toUpperCase(),
        isToday: isToday,
        fullDate: day.toDate(), // Guarda a data completa para facilitar o uso
      });
    }
    return days;
    // .map((day, index) => (
    //   <TouchableOpacity
    //     key={index}
    //     onPress={() => setSelectedDate(day.fullDate)} // Atualiza a data selecionada
    //   >
    //     <View
    //       style={[
    //         styles.dayItem,
    //         day.isToday && styles.currentDay, // Aplica o estilo se for o dia atual
    //       ]}
    //     >
    //       <Text
    //         style={[
    //           styles.dayNumber,
    //           day.isToday && styles.currentDayText, // Aplica o estilo do texto se for o dia atual
    //         ]}
    //       >
    //         {day.dayNumber}
    //       </Text>
    //       <Text
    //         style={[
    //           styles.dayName,
    //           day.isToday && styles.currentDayText, // Aplica o estilo do texto se for o dia atual
    //         ]}
    //       >
    //         {day.dayName}
    //       </Text>
    //     </View>
    //   </TouchableOpacity>
    // ));
  };

  const deleteTaskById = async (taskId: string) => {
    try {
      const response = await fetch(`https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Erro ao deletar tarefa:", await response.text());
      }
    } catch (error) {
      console.error("Erro ao deletar tarefa:", error);
    }
  };

  // Função para deletar todas as tarefas
  const deleteAllTasks = async () => {
    try {
      // Exibe uma confirmação antes de deletar
      Alert.alert(
        "Confirmação",
        "Você tem certeza que deseja deletar todas as tarefas?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Deletar",
            style: "destructive",
            onPress: async () => {
              for (const task of tasks) {
                await deleteTaskById(task.id);
              }
              setTasks([]); // Limpa a lista localmente após deletar
            },
          },
        ],
        { cancelable: true },
      );
    } catch (error) {
      console.error("Erro ao deletar todas as tarefas:", error);
    }
  };

  const filterTasksByDate = (tasks: Task[], selectedDate: Date): Task[] => {
    return tasks.filter((task: any) => {
      const taskStartDate = task.startDate ? new Date(task.startDate._seconds * 1000) : null;
      const taskEndDate = task.endDate ? new Date(task.endDate._seconds * 1000) : null;
      const taskCreatedAt = task.createdAt ? new Date(task.createdAt._seconds * 1000) : null;

      // Converte a data selecionada para uma string no formato "YYYY-MM-DD"
      const selectedDateStr = moment(selectedDate).format("YYYY-MM-DD");

      // Verifica se a tarefa é recorrente
      if (task.isRecurring) {
        if (task.recurrencePattern === "daily") {
          // Para recorrências diárias, exibir a partir da startDate (se existir) até endDate (se existir)
          if (taskStartDate) {
            const taskStartDateStr = moment(taskStartDate).format("YYYY-MM-DD");
            return taskStartDateStr <= selectedDateStr && (!taskEndDate || moment(selectedDate).isSameOrBefore(taskEndDate));
          }
          return true; // Se não houver startDate, considera a tarefa sempre válida
        }
        // Adicione outras lógicas de recorrência (semanal, mensal, etc.) aqui, se necessário
      } else {
        // Se não for recorrente, verifica se a createdAt corresponde à data selecionada
        if (taskCreatedAt) {
          const taskCreatedAtStr = moment(taskCreatedAt).format("YYYY-MM-DD");
          return taskCreatedAtStr === selectedDateStr;
        }
        return false; // Não exibe a tarefa se createdAt for null ou não corresponder à data selecionada
      }
    });
  };

  // useEffect para atualizar as tarefas filtradas quando selectedDate ou tasks mudarem
  useEffect(() => {
    setFilteredTasks(filterTasksByDate(tasks, selectedDate));
  }, [selectedDate, tasks]);

  return (
    <View style={styles.container}>
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteText}>{quote}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Tarefas</Text>
        <TouchableOpacity onPress={deleteAllTasks}>
          <Icon name='trash-bin' size={30} color='#FF6347' />
        </TouchableOpacity>
      </View>

      <View style={styles.daysContainer}>
        {renderDays().map((day: any, index: any) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDate(day.fullDate)} // Atualiza a data selecionada
          >
            <View
              style={[
                styles.dayItem,
                day.fullDate.toDateString() === selectedDate.toDateString() && styles.currentDay, // Aplica o estilo se for a data selecionada
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  day.fullDate.toDateString() === selectedDate.toDateString() && styles.currentDayText, // Aplica o estilo do texto se for a data selecionada
                ]}
              >
                {day.dayNumber}
              </Text>
              <Text
                style={[
                  styles.dayName,
                  day.fullDate.toDateString() === selectedDate.toDateString() && styles.currentDayText, // Aplica o estilo do texto se for a data selecionada
                ]}
              >
                {day.dayName}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Animated.View style={[styles.addButton, animatedStyle]}>
        <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={() => navigation.navigate("Tasks", { taskId: null })}>
          <Icon name='add-circle' size={56} color='#FFFFFF' />
        </TouchableOpacity>
      </Animated.View>
      {loading ? (
        <ActivityIndicator size='large' color='#0000ff' />
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LottieView
            source={require("../assets/empty-box.json")} // Caminho para o arquivo .json da animação
            autoPlay
            loop
            style={styles.animation}
          />
          <Text style={styles.emptyMessage}>Nenhuma tarefa encontrada!</Text>
          <Text style={styles.subMessage}>Adicione novas tarefas para vê-las aqui.</Text>
        </View>
      ) : (
        <FlatList data={tasks} style={styles.flatList} keyExtractor={(item) => item.id} renderItem={({ item }) => <TaskItem task={item} onEdit={handleEditTask} onRemove={handleRemoveTask} refreshTasks={() => fetchTasks(userId!)} />} />
      )}
    </View>
  );
};

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
  logo: {
    width: "100%",
    height: 70,
    marginBottom: 20,
    resizeMode: "contain", // Ensures the image maintains its aspect ratio
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animation: {
    width: 150,
    height: 150,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
  },
  subMessage: {
    fontSize: 14,
    marginTop: 10,
    color: "#666",
  },
  quoteContainer: {
    marginVertical: 20,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    width: "100%",
  },
  dayItem: {
    alignItems: "center",
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dayName: {
    fontSize: 14,
    color: "#555",
  },
  currentDay: {
    borderColor: "#000", // Borda preta
    borderWidth: 2,
    backgroundColor: "#ff6347", // Cor de fundo vermelha
    borderRadius: 8,
    padding: 10,
  },
  currentDayText: {
    color: "#fff", // Texto branco para destacar no fundo vermelho
  },
  header: {
    display: "none",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
});

export default HomeScreen;
