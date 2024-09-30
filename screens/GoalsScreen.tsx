import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos
type Periodicity = "diaria" | "semanal" | "mensal" | "trimestral" | "semestral" | "anual";

// Cores de periodicidade
const periodicityColors = {
  diaria: "yellow",
  semanal: "green",
  mensal: "blue",
  trimestral: "red",
  semestral: "purple",
  anual: "black",
};

const GoalsScreen = () => {
  const [goals, setGoals] = useState<{ id: string; text: string; periodicity: Periodicity; userId: string }[]>([]);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<Periodicity>("diaria");
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState<string>("");
  const [newGoalPeriodicity, setNewGoalPeriodicity] = useState<Periodicity>("diaria");

  // Filtra as metas pela periodicidade selecionada
  const filteredGoals = goals.filter((goal) => goal.periodicity === selectedPeriodicity);

  const fetchUserId = async () => {
    try {
      let storedUserId = await AsyncStorage.getItem("tempUserId");
      if (storedUserId) {
        console.log("User ID found in AsyncStorage:", storedUserId);
        return storedUserId;
      }

      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No authToken found in AsyncStorage");
        return null;
      }

      const response = await fetch("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/userId", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User ID from API:", data.userId);
        await AsyncStorage.setItem("tempUserId", data.userId);
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

  // Função para buscar metas da API
  const fetchGoalsFromApi = async () => {
    try {
      const userId = await fetchUserId();
      if (!userId) {
        console.error("No user ID found, cannot fetch goals");
        return;
      }

      const response = await axios.get("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/goals", {
        params: { userId },
      });

      if (response.status === 200) {
        setGoals(response.data); // Atualiza o estado com as metas retornadas
      }
    } catch (error: any) {
      console.error("Erro ao buscar metas:", error);
      Alert.alert("Erro ao buscar metas. Tente novamente.");
    }
  };

  // Função para deletar uma meta
  const deleteGoal = async (id: string) => {
    try {
      const response = await axios.delete(`https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/goals/${id}`);
      if (response.status === 200 || response.status === 204) {
        setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== id));
        Alert.alert("Meta deletada com sucesso!");
      } else {
        Alert.alert("Erro ao deletar a meta. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao deletar meta:", error);
      Alert.alert("Erro ao deletar meta. Tente novamente.");
    }
  };

  // Função para confirmar antes de deletar
  const confirmDelete = (id: string) => {
    Alert.alert(
      "Confirmação",
      "Você tem certeza que deseja deletar essa meta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Deletar", onPress: () => deleteGoal(id), style: "destructive" },
      ]
    );
  };

  // Função para adicionar meta na API
  const addGoalToApi = async (goal: { text: string; periodicity: Periodicity }) => {
    try {
      const userId = await fetchUserId();
      if (!userId) {
        console.error("No user ID found, cannot add goal");
        return;
      }

      const goalWithUserId = { ...goal, userId };
      console.log("Adding goal:", goalWithUserId);

      const response = await axios.post("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/goals", goalWithUserId);
      if ((response.status === 201 || response.status === 200 || response.status === 202) && response.data.id) {
        setGoals((prevGoals) => [...prevGoals, { ...goalWithUserId, id: response.data.id }]);
        Alert.alert("Meta adicionada com sucesso!");
      } else {
        Alert.alert("Erro ao adicionar a meta. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao adicionar meta:", error);
      Alert.alert("Erro ao adicionar meta. Tente novamente.");
    }
  };

  // useEffect para buscar as metas quando o componente montar
  useEffect(() => {
    fetchGoalsFromApi();
  }, []);

  // Função para adicionar a meta localmente e na API
  const addGoal = () => {
    const newGoal = { text: newGoalText, periodicity: newGoalPeriodicity };
    setModalVisible(false); // Fecha o modal
    setNewGoalText(""); // Limpa o texto da nova meta
    addGoalToApi(newGoal); // Envia para a API
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Metas</Text>

      <Picker selectedValue={selectedPeriodicity} onValueChange={(itemValue) => setSelectedPeriodicity(itemValue)} style={styles.picker}>
        <Picker.Item label='Diária' value='diaria' />
        <Picker.Item label='Semanal' value='semanal' />
        <Picker.Item label='Mensal' value='mensal' />
        <Picker.Item label='Trimestral' value='trimestral' />
        <Picker.Item label='Semestral' value='semestral' />
        <Picker.Item label='Anual' value='anual' />
      </Picker>

      <FlatList
        data={filteredGoals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <Icon
              name='ellipse'
              size={24}
              color={periodicityColors[item.periodicity]} // Cor da bolinha baseada na periodicidade
            />
            <Text style={styles.goalText}>{item.text}</Text>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteButton}>
              <Icon name='trash' size={24} color='red' />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Botão para abrir o modal de adicionar nova meta */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name='add-circle' size={56} color='#FFFFFF' />
      </TouchableOpacity>

      {/* Modal para adicionar uma nova meta */}
      <Modal visible={isModalVisible} animationType='slide'>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Adicionar Nova Meta</Text>

          <TextInput style={styles.input} placeholder='Digite o nome da meta' value={newGoalText} onChangeText={setNewGoalText} />

          <Picker selectedValue={newGoalPeriodicity} onValueChange={(itemValue) => setNewGoalPeriodicity(itemValue)} style={styles.picker}>
            <Picker.Item label='Diária' value='diaria' />
            <Picker.Item label='Semanal' value='semanal' />
            <Picker.Item label='Mensal' value='mensal' />
            <Picker.Item label='Trimestral' value='trimestral' />
            <Picker.Item label='Semestral' value='semestral' />
            <Picker.Item label='Anual' value='anual' />
          </Picker>

          <Button title='Adicionar Meta' onPress={addGoal} />
          <Button title='Cancelar' onPress={() => setModalVisible(false)} color='red' />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    marginBottom: 20,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  goalText: {
    marginLeft: 10,
    fontSize: 18,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  deleteButton: {
    marginLeft: 10,
  }
});

export default GoalsScreen;
