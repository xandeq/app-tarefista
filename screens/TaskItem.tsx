import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Animated, { SlideInLeft, SlideOutRight } from "react-native-reanimated";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onRemove: (id: string) => void;
  refreshTasks: () => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onRemove,
  refreshTasks,
  onEdit,
}) => {
  const handleRemove = () => {
    confirmRemove(task.id);
  };

  const confirmRemove = async (taskId: string) => {
    console.log("onPress: ", taskId);
    try {
      const response = await fetch(
        `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${taskId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        onRemove(taskId);
        refreshTasks();
      } else {
        console.error("Erro ao remover tarefa: ", await response.text());
      }
    } catch (error) {
      console.log("onPress error: ", taskId);
      console.error("Erro ao remover tarefa: ", error);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(
        `https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: !task.completed }),
        }
      );
      if (response.ok) {
        refreshTasks();
      } else {
        console.error("Erro ao atualizar tarefa: ", await response.text());
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa: ", error);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  return (
    <Animated.View
      entering={SlideInLeft}
      exiting={SlideOutRight}
      style={[styles.task, task.completed && styles.taskCompleted]}
    >
      <View style={styles.taskContent}>
        <TouchableOpacity onPress={handleComplete}>
          <Icon
            name={task.completed ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={task.completed ? "green" : "gray"}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.taskContent}>
          <Text
            style={[
              styles.taskText,
              task.completed && styles.taskTextCompleted,
            ]}
          >
            {task.text}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleRemove}>
        <Icon name="trash" size={24} color="red" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  task: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  taskContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskCompleted: {
    backgroundColor: "#d4edda",
  },
  taskText: {
    fontSize: 18,
    flex: 1,
    marginLeft: 10,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});

export default TaskItem;
