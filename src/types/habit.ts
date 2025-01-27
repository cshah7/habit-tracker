export interface Habit {
  id: string;
  name: string;
  createdAt: Date;
  streak: number;
  completedDates: string[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: Date;
  completed: boolean;
} 