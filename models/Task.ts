export interface Task {
  id?: string; // Opcional para novas tarefas
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  tempUserId?: string; // Opcional para usuários temporários
  completionDate?: string;
}
