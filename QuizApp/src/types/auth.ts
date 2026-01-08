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

export interface AdminUserDTO {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  roles: string[];
}

export interface UserRoleDTO {
  userId: string;
  role: string;
}
