import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_STORAGE_KEY = '@tasks';

export const storeTask = async (task: any) => {
    try {
        const existingTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        const tasks = existingTasks ? JSON.parse(existingTasks) : [];
        tasks.push(task);
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error("Erro ao armazenar tarefa: ", error);
    }
};

export const getTasksFromAsyncStorage = async () => {
    try {
        const tasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
        console.error("Erro ao recuperar tarefas: ", error);
        return [];
    }
};

export const clearTasksFromAsyncStorage = async () => {
    try {
        await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    } catch (error) {
        console.error("Erro ao limpar tarefas: ", error);
    }
};
