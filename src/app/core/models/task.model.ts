export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Active' | 'Completed';
export type TaskRecurrence = 'Daily' | 'Weekly' | 'Monthly' | null;

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  tags?: string[];
  recurrence: TaskRecurrence;
  createdAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: Date;
  priority: TaskPriority;
  tags?: string[];
  recurrence: TaskRecurrence;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
}