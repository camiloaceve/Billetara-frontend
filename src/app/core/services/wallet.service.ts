import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  BalanceResponse, 
  RechargeRequest, 
  RechargeResponse,
  InitPaymentRequest, 
  InitPaymentResponse, 
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  Transaction 
} from '../models/wallet.models';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  constructor(private apiService: ApiService) {}

  getBalance(documento: string): Observable<BalanceResponse> {
    return this.apiService.get<BalanceResponse>('/billetera/saldo', { documento });
  }

  recharge(data: RechargeRequest): Observable<RechargeResponse> {
    return this.apiService.post<RechargeResponse>('/billetera/recarga', data);
  }

  initiatePayment(data: InitPaymentRequest): Observable<InitPaymentResponse> {
    return this.apiService.post<InitPaymentResponse>('/billetera/iniciar-pago', data);
  }

  confirmPayment(data: ConfirmPaymentRequest): Observable<ConfirmPaymentResponse> {
    return this.apiService.post<ConfirmPaymentResponse>('/billetera/confirmar-pago', data);
  }

  getTransactions(documento: string, limit?: number): Observable<any> {
    return this.apiService.get('/billetera/transacciones', { documento, limit });
  }
}