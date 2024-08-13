import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_COUNT_KEY = "TASK_COUNT_KEY";

export const getTaskCount = async () => {
  const jsonValue = await AsyncStorage.getItem(TASK_COUNT_KEY);
  return jsonValue != null
    ? JSON.parse(jsonValue)
    : { count: 0, date: new Date().toISOString().slice(0, 10) };
};

export const incrementTaskCount = async () => {
  const current = await getTaskCount();
  const today = new Date().toISOString().slice(0, 10);

  if (current.date !== today) {
    current.count = 0; // Reset count for the new day
    current.date = today;
  }

  current.count += 1;
  await AsyncStorage.setItem(TASK_COUNT_KEY, JSON.stringify(current));

  return current.count;
};

export const resetTaskCount = async () => {
  await AsyncStorage.setItem(
    TASK_COUNT_KEY,
    JSON.stringify({ count: 0, date: new Date().toISOString().slice(0, 10) })
  );
};
