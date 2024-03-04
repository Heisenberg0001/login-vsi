export interface TaskDto {
  id: string;
  name: string;
  description?: string;
  creationDate: Date;
  modificationDate: Date;
  userId?: string;
  userName?: string;
  state: TaskState;
}

export enum TaskState {
  Queue = 'Queue',
  Progress = 'Progress',
  Done = 'Done',
}
