export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  documento?: string;
  telefono?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    access_token: string;
    user: User;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
}

export interface RegisterResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    documento: string;
    message: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface ResendVerificationRequest {
  email: string;
}