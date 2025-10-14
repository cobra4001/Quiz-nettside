export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  confirmEmail: string;
  phonenumber: string;
  confirmPhonenumber: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateContactDTO {
  email: string;
  phonenumber: string;
}

export interface ChangePasswordDTO {
  password: String;
  confirmPassword: String;
}
