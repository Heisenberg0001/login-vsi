export interface UserDto {
  id: string;
  name: string;
  surname: string;
  taskId: string | null | undefined;
  creationDate: Date;
  modificationDate: Date;
}

export interface UserViewDto
  extends Omit<UserDto, 'surname' | 'modificationDate'> {}
