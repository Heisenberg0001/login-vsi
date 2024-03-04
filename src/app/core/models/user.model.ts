export interface UserDto {
  id: string;
  name: string;
  surname: string;
  taskId?: string | null;
  taskName?: string | null;
  creationDate: Date;
  modificationDate: Date;
}

export interface UserViewDto
  extends Omit<UserDto, 'surname' | 'modificationDate'> {}
