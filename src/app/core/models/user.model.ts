export interface UserDto {
  id: string;
  name: string;
  surname: string;
  taskId: string;
  createdDate: Date;
  modificationDate: Date;
}

export interface UserViewDto
  extends Omit<UserDto, 'surname' | 'modificationDate'> {}
