export interface TaskDto {
  id: string;
  name: string;
  description?: string;
  creationDate: Date;
  modificationDate: Date;
  assignedTo?: string;
  state: TaskState;
}

export enum TaskState {
  Queue = 'Queue',
  Progress = 'Progress',
  Done = 'Done',
}
