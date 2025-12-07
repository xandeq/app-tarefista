import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API_BASE_URL from "../config/apiConfig";

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

const extractUserIdFromJwt = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) return null;
  try {
    const [, payloadB64] = token.split(".");
    const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    return typeof data.userId === "string" ? data.userId : null;
  } catch {
    return null;
  }
};

const GoalsScreen = () => {
  const [goals, setGoals] = useState<{ id: string; text: string; periodicity: Periodicity; userId: string }[]>([]);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<Periodicity>("diaria");
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState<string>("");
  const [newGoalPeriodicity, setNewGoalPeriodicity] = useState<Periodicity>("diaria");

  // Filtra as metas pela periodicidade selecionada
  const filteredGoals = goals.filter((goal) => goal.periodicity === selectedPeriodicity);

  // Substitua a função fetchUserId inteira por:
  const getEffectiveIdentity = async (): Promise<{ userId: string | null; tempUserId: string | null; authToken: string | null }> => {
    const authToken = await AsyncStorage.getItem("authToken");
    const userIdFromJwt = await extractUserIdFromJwt();
    // se estiver logado, use o userId do JWT
    if (userIdFromJwt) return { userId: userIdFromJwt, tempUserId: null, authToken };

    // anônimo: tente recuperar/gerar tempUserId
    let temp = await AsyncStorage.getItem("tempUserId");
    if (!temp) {
      // opcional: chame sua rota que cria um tempUserId; se não tiver, gere localmente
      temp = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
      await AsyncStorage.setItem("tempUserId", temp);
    }
    return { userId: null, tempUserId: temp, authToken: null };
  };

  // Função para buscar metas da API
  const fetchGoalsFromApi = async () => {
    try {
      const { userId, tempUserId, authToken } = await getEffectiveIdentity();
      const params = userId ? { userId } : { tempUserId }; // <-- chave certa conforme login

      const response = await axios.get(`${API_BASE_URL}/goals`, {
        params,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if (response.status === 200) {
        // se sua API ainda devolve { id, data: {...} }, achatar aqui:
        const items = Array.isArray(response.data) ? response.data.map((g: any) => (g.data ? { id: g.id, ...g.data } : g)) : [];
        setGoals(items);
      }
    } catch (error: any) {
      console.error("Erro ao buscar metas:", error);
      Alert.alert("Erro ao buscar metas. Tente novamente.");
    }
  };

  // Função para deletar uma meta
  const deleteGoal = async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/goals/${id}`);
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
    Alert.alert("Confirmação", "Você tem certeza que deseja deletar essa meta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Deletar", onPress: () => deleteGoal(id), style: "destructive" },
    ]);
  };

  // Função para adicionar meta na API
  const addGoalToApi = async (goal: { text: string; periodicity: Periodicity }) => {
    try {
      const { userId, tempUserId, authToken } = await getEffectiveIdentity();
      const payload = userId ? { ...goal, userId } : { ...goal, tempUserId };

      const response = await axios.post(`${API_BASE_URL}/goals`, payload, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });

      if ((response.status === 201 || response.status === 200 || response.status === 202) && response.data.id) {
        const returned = response.data.goal ? { id: response.data.id, ...response.data.goal } : { id: response.data.id, ...payload };
        setGoals((prev) => [...prev, returned]);
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
  },
});

export default GoalsScreen;
