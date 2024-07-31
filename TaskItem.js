import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

const TaskItem = ({ task, removeTask }) => {
  return (
    <View style={styles.task}>
      <Text style={styles.taskText}>{task.text}</Text>
      <Button title="Remover" onPress={() => removeTask(task.id)} />
    </View>
  );
};

const styles = StyleSheet.create({
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskText: {
    fontSize: 18,
  },
});

export default TaskItem;