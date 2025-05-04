export interface User {
  userId: string;
  username: string;
  email?: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterUser extends UserCredentials {
  email: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
}