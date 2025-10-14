export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  phonenumber: string;
  password: string;
  confirmPassword: string;
}
