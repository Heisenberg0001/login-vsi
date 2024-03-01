export interface TaskDto {
  name: string;
  description: string;
  creationDate: Date;
  modificationDate: Date;
  state: State;
}

export enum State {
  Queue = 'Queue',
  Progress = 'Progress',
  Done = 'Done',
}
