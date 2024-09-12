export interface Task {
  id?: string;
  text: string;
  completed: boolean;
  createdAt: any;
  updatedAt: string;
  userId?: string;
  tempUserId?: string;
  completionDate?: string;
  isRecurring: boolean;   // New property to flag if the task is recurring
  recurrencePattern?: string; // Recurrence pattern: "daily", "weekly", "monthly", etc.
  startDate?: string;     // When the recurrence starts
  endDate?: string;       // When the recurrence ends
}