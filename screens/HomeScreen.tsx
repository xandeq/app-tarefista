import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import TaskItem from "./TaskItem";
import Icon from "react-native-vector-icons/Ionicons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import axios from "axios";

const logo = require("../assets/logo.png");

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        "https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks"
      );
      if (response.data) {
        console.log(response.data);
        //const tasksData = await response.json();
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRemoveTask = (taskId: string) => {
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
  const handleEditTask = (task: any) => {
    setTaskToEdit(task);
    navigation.navigate("Task", { task, refreshTasks: fetchTasks });
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} />
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
              onEdit={handleEditTask}
              onRemove={handleRemoveTask}
              refreshTasks={fetchTasks}
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
