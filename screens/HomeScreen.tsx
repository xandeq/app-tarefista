import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import TaskItem from "./TaskItem";
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface HomeScreenProps {
  navigation: any;
  route: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null); // Declare the 'userId' variable

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

      const response = await axios.get(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks",
        {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
          params: { tempUserId: userId }, // Pass the userId or tempUserId here
        }
      );

      if (response.data) {
        console.log("Tasks fetched:", response.data);
        setTasks(response.data);
      } else {
        console.error("Error fetching tasks:", response.statusText);
      }
    } catch (error) {
      // Verifica se o erro é uma instância de AxiosError
      if (axios.isAxiosError(error)) {
        console.error("Error fetching tasks: AxiosError:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          headers: error.response?.headers,
          data: error.response?.data,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o userId do AsyncStorage ou da API
  const fetchUserId = async () => {
    try {
      console.log("fetchUserId HOME entrou na function");
      // Primeiro, verifique se o userId já está no AsyncStorage
      let storedUserId = await AsyncStorage.getItem("tempUserId");
      if (storedUserId) {
        console.log("User ID found in AsyncStorage:", storedUserId);
        setUserId(storedUserId);
        return storedUserId;
      }

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No authToken found in AsyncStorage");
        return null;
      }
      console.log("fetchUserId Token:", token);

      // Faça a chamada à API para obter o userId
      const response = await fetch(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/userId",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("fetchUserId data.userId:", data.userId);

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
      console.log("useEffect fetchedUserId HOME:", fetchedUserId);
      if (fetchedUserId) {
        await fetchTasks(fetchedUserId); // Chama fetchTasks com o userId obtido
      } else {
        // Se o fetchedUserId for null, defina a lista de tarefas como vazia
        console.log("User ID is null, setting tasks to an empty array.");
        setTasks([]); // Carrega uma lista de tarefas vazia
        setLoading(false); // Certifique-se de que o indicador de carregamento pare
      }
    };

    //if (route.params?.taskUpdated) {
    loadUserIdAndTasks();
    //}

    const unsubscribe = navigation.addListener("focus", () => {
      if (userId) {
        fetchTasks(userId); // Chama fetchTasks com o userId do estado
      }
    });

    return unsubscribe;
  }, [navigation, userId, route.params?.taskUpdated]);

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
    navigation.navigate("Tarefas", { task: task });
  };

  const handleRemoveTask = (taskId: string) => {
    console.log("handleRemoveTask Removing task with id: ", taskId);
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    console.log("authToken removido do AsyncStorage");
    // Redirecione o usuário para a tela de login ou inicial
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.addButton, animatedStyle]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => navigation.navigate("Tarefas", { taskId: null })}
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
              onEdit={handleEditTask}
              onRemove={handleRemoveTask}
              refreshTasks={() => fetchTasks(userId!)}
            />
          )}
        />
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
});

export default HomeScreen;
