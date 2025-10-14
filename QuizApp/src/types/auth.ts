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

export interface UpdateContactDTO {
  email: string;
  phonenumber: string;
}

export interface ChangePasswordDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
