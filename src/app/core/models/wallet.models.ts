export interface BalanceResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    documento: string;
    saldo: number;
    updatedAt: string;
  };
}

export interface RechargeRequest {
  documento: string;
  valor: number;
}

export interface RechargeResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    documento: string;
    saldo: number;
    updatedAt: string;
  };
}

export interface InitPaymentRequest {
  email: string;
  documento: string;
  monto: number;
}

export interface InitPaymentResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    mensaje: string;
    sessionId: string;
  };
}

export interface ConfirmPaymentRequest {
  sessionId: string;
  token: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  cod_error: string;
  message_error: string;
  data: {
    mensaje: string;
    monto: number;
  };
}

export interface Transaction {
  id: string;
  tipo: 'PAGO' | 'RECARGA';
  monto: number;
  fecha: string;
  estado: 'EXITOSO' | 'PENDIENTE' | 'FALLIDO';
  descripcion?: string;
}