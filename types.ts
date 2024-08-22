// types.ts
export type RootStackParamList = {
    Login: undefined;
    Inicio: undefined;
    Registrar: undefined;
    Perfil: undefined;
    Tarefas: { taskId: string } | undefined;
  };