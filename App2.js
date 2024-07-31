import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList, ActivityIndicator } from 'react-native';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import TaskItem from './TaskItem';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const taskCollection = await getDocs(collection(db, 'tasks'));
      const tasksData = taskCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (newTask.trim() === '') {
      alert('Task cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const newTaskRef = await addDoc(collection(db, 'tasks'), { text: newTask, completed: false });
      setTasks((prevTasks) => [
        ...prevTasks,
        { id: newTaskRef.id, text: newTask, completed: false },
      ]);
      setNewTask('');
    } catch (error) {
      console.error('Error adding task: ', error);
    } finally {
      setLoading(false);
    }
  };

  const removeTask = async (taskId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Error removing task: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefista</Text>
      <TextInput
        style={styles.input}
        placeholder="Nova Tarefa"
        value={newTask}
        onChangeText={(text) => setNewTask(text)}
      />
      <Button title="Adicionar Tarefa" onPress={addTask} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} removeTask={removeTask} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  },
});
