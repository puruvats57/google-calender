export type Category = 'To Do' | 'In Progress' | 'Review' | 'Completed';

export interface Task {
  id: string;
  name: string;
  category: Category;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // inclusive, yyyy-MM-dd
  color?: string;
}
