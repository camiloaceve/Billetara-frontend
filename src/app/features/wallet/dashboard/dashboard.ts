import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { WalletService } from '../../../core/services/wallet.service';
import { User } from '../../../core/models/auth.models';
import { Transaction } from '../../../core/models/wallet.models';
import Swal from 'sweetalert2';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  currentUser: User | null = null;
  balance: number = 0;
  sessionId: string = '';
  recentTransactions: Transaction[] = [];
  loading = {
    balance: false,
    recharge: false,
    payment: false,
    transactions: false
  };

  rechargeForm: FormGroup;
  paymentForm: FormGroup;
  confirmForm: FormGroup;

  private balanceSubscription?: Subscription;
  currentTab: string = 'dashboard';

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.rechargeForm = this.fb.group({
      documento: ['', [Validators.required]],
      valor: ['', [Validators.required, Validators.min(1000), Validators.max(10000000)]]
    });

    this.paymentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      documento: ['', [Validators.required]],
      monto: ['', [Validators.required, Validators.min(100), Validators.max(10000000)]]
    });

    this.confirmForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();

    if (this.currentUser?.documento) {
      this.loadBalance();
      this.loadTransactions();
      this.setupAutoRefresh();
    }

    // Setear documento por defecto en formularios
    if (this.currentUser?.documento) {
      this.rechargeForm.patchValue({ documento: this.currentUser.documento });
    }
  }

  ngOnDestroy(): void {
    this.balanceSubscription?.unsubscribe();
  }

  setupAutoRefresh(): void {
    // Actualizar saldo cada 30 segundos
    this.balanceSubscription = interval(30000).subscribe(() => {
      this.loadBalance(false);
    });
  }

  loadBalance(showLoading: boolean = true): void {
    if (!this.currentUser?.documento) return;

    if (showLoading) this.loading.balance = true;

    this.walletService.getBalance(this.currentUser.documento).subscribe({
      next: (response) => {
        if (response.success) {
          this.balance = response.data.saldo;
        }
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      },
      complete: () => {
        this.loading.balance = false;
      }
    });
  }

  loadTransactions(): void {
    if (!this.currentUser?.documento) return;

    this.loading.transactions = true;

    this.walletService.getTransactions(this.currentUser.documento, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.recentTransactions = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      },
      complete: () => {
        this.loading.transactions = false;
      }
    });
  }

  onRecharge(): void {
    if (this.rechargeForm.invalid) {
      this.rechargeForm.markAllAsTouched();
      return;
    }

    this.loading.recharge = true;

    this.walletService.recharge(this.rechargeForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Recarga exitosa!',
            text: `Se han recargado $${response.data.saldo.toLocaleString()} COP`,
            timer: 2000,
            showConfirmButton: false
          });

          this.balance = response.data.saldo;
          this.rechargeForm.patchValue({ valor: '' });
          this.loadTransactions(); // Actualizar transacciones
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message_error || 'Error al realizar la recarga'
        });
      },
      complete: () => {
        this.loading.recharge = false;
      }
    });
  }

  onInitiatePayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loading.payment = true;

    this.walletService.initiatePayment(this.paymentForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          this.sessionId = response.data.sessionId;
          Swal.fire({
            icon: 'success',
            title: 'Código enviado',
            text: response.data.mensaje,
            timer: 3000,
            showConfirmButton: false
          });
          this.currentTab = 'confirm'; // Cambiar a pestaña de confirmación
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message_error || 'Error al iniciar el pago'
        });
      },
      complete: () => {
        this.loading.payment = false;
      }
    });
  }

  onConfirmPayment(): void {
    if (this.confirmForm.invalid || !this.sessionId) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    const data = {
      sessionId: this.sessionId,
      token: this.confirmForm.value.token
    };

    this.walletService.confirmPayment(data).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Pago confirmado!',
            text: response.data.mensaje,
            timer: 2000,
            showConfirmButton: false
          });

          this.sessionId = '';
          this.confirmForm.reset();
          this.currentTab = 'dashboard';
          this.loadBalance();
          this.loadTransactions();
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message_error || 'Error al confirmar el pago'
        });
      }
    });
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
      }
    });
  }

  setTab(tab: string): void {
    this.currentTab = tab;

    // Resetear formularios al cambiar de pestaña
    if (tab === 'recharge') {
      this.rechargeForm.reset({ documento: this.currentUser?.documento });
    } else if (tab === 'payment') {
      this.paymentForm.reset();
      this.sessionId = '';
      this.confirmForm.reset();
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  }

  getTransactionIcon(type: string): string {
    return type === 'PAGO' ? 'bi-arrow-up-right-circle' : 'bi-arrow-down-left-circle';
  }

  getTransactionClass(type: string): string {
    return type === 'PAGO' ? 'text-danger' : 'text-success';
  }
}
