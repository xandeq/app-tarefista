import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Text,
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
import LottieView from "lottie-react-native";
import moment from "moment"; // Biblioteca para manipular datas

interface HomeScreenProps {
  navigation: any;
  route: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation, route }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [quote, setQuote] = useState<string>("");
  const [days, setDays] = useState<any[]>([]);

  const fetchTasks = async (userId: string) => {
    try {
      let token = await AsyncStorage.getItem("authToken");
      if (!token) {
        token = await AsyncStorage.getItem("tempUserId");
      }
      if (!token) return;

      const response = await axios.get(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks",
        {
          params: { tempUserId: userId },
        }
      );
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    try {
      const response = await axios.get(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/phrases"
      );
      const { phrase } = response.data;
      return phrase;
    } catch (error) {
      console.error("Error fetching phrase: ", error);
      return "Erro ao buscar frase";
    }
  };

  const generateDays = () => {
    const today = moment();
    const weekDays = [];
    for (let i = 0; i < 30; i++) {
      const day = today.clone().add(i, "days");
      weekDays.push({
        dayName: day.format("ddd").toUpperCase(),
        dayNumber: day.format("DD"),
      });
    }
    setDays(weekDays);
  };

  const fetchUserId = async () => {
    try {
      let storedUserId = await AsyncStorage.getItem("tempUserId");
      if (!storedUserId) {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return null;
        const response = await fetch(
          "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/userId",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        await AsyncStorage.setItem("tempUserId", data.userId);
        storedUserId = data.userId;
      }
      setUserId(storedUserId);
      return storedUserId;
    } catch (error) {
      console.error("Error fetching user ID:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadUserIdAndTasks = async () => {
      const fetchedUserId = await fetchUserId();
      if (fetchedUserId) {
        await fetchTasks(fetchedUserId);
      } else {
        setLoading(false);
      }
      const fetchedQuote = await fetchQuote();
      setQuote(fetchedQuote);
      generateDays();
    };

    loadUserIdAndTasks();

    const unsubscribe = navigation.addListener("focus", () => {
      if (userId) {
        fetchTasks(userId);
      }
    });

    return unsubscribe;
 
