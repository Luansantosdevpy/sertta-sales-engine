export interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  phoneNumber?: string;
}
