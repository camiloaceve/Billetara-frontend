import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
   verifyForm!: FormGroup;
  resendForm!: FormGroup;
  loading = false;
  resendLoading = false;
  email: string = '';
  countdown: number = 60;
  canResend: boolean = true;
  private countdownInterval: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });

    this.initForms();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  initForms(): void {
    this.verifyForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.resendForm = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]]
    });
  }

  onVerify(): void {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.verifyEmail(this.verifyForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Email verificado!',
            text: 'Tu cuenta ha sido activada. Ya puedes iniciar sesión.',
            confirmButtonText: 'Ir al login'
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
        }
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message_error || 'Código inválido'
        });
      }
    });
  }

  onResendCode(): void {
    if (this.resendForm.invalid || !this.canResend) {
      return;
    }

    this.resendLoading = true;

    this.authService.resendVerification(this.resendForm.value).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Código reenviado',
            text: 'Revisa tu email para obtener el nuevo código',
            timer: 3000,
            showConfirmButton: false
          });
          
          this.startCountdown();
        }
      },
      error: (error) => {
        this.resendLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.message_error || 'Error al reenviar código'
        });
      }
    });
  }

  startCountdown(): void {
    this.canResend = false;
    this.countdown = 60;
    
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown === 0) {
        this.canResend = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  get verificationCode() { return this.verifyForm.get('verificationCode'); }
}
