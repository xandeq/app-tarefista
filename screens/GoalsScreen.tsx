import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import axios from "axios";

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
  const [goals, setGoals] = useState<{ id: string; text: string; periodicity: Periodicity }[]>([]);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<Periodicity>("diaria");
  const [isModalVisible, setModalVisible] = useState(false);
  const [newGoalText, setNewGoalText] = useState<string>("");
  const [newGoalPeriodicity, setNewGoalPeriodicity] = useState<Periodicity>("diaria");

  // Filtra as metas pela periodicidade selecionada
  const filteredGoals = goals.filter((goal) => goal.periodicity === selectedPeriodicity);

  // Função para buscar metas da API
  const fetchGoalsFromApi = async () => {
    try {
      const response = await axios.get("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/goals");
      if (response.status === 200) {
        setGoals(response.data); // Atualiza o estado com as metas retornadas
      }
    } catch (error: any) {
      // O 'any' permite acessar propriedades mais específicas do erro
      if (error.response) {
        // O servidor respondeu com um código de status fora da faixa 2xx
        console.error("Erro ao buscar metas:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        // O pedido foi feito, mas nenhuma resposta foi recebida
        console.error("Nenhuma resposta recebida:", error.request);
      } else {
        // Algo aconteceu na configuração do pedido que acionou um erro
        console.error("Erro na requisição:", error.message);
      }
      Alert.alert("Erro ao buscar metas. Tente novamente.");
    }
  };

  // Função para adicionar meta na API
  const addGoalToApi = async (goal: { text: string; periodicity: Periodicity }) => {
    try {
      console.log("Object goal = ", goal);
      const response = await axios.post("https://tarefista-api-81ceecfa6b1c.herokuapp.com/api/goals", goal);
      if (response.status === 200) {
        Alert.alert("Meta adicionada com sucesso!");
        fetchGoalsFromApi(); // Atualiza a lista de metas após adicionar
      }
    } catch (error: any) {
      // O 'any' permite acessar propriedades mais específicas do erro
      if (error.response) {
        console.error("Erro ao adicionar meta:", error.response.data);
        console.error("Status:", error.response.status);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("Nenhuma resposta recebida:", error.request);
      } else {
        console.error("Erro na requisição:", error.message);
      }
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
          </View>
        )}
      />

      {/* Botão para abrir o modal de adicionar nova meta */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name='add-circle' size={56} color='#FF6347' />
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
});

export default GoalsScreen;
