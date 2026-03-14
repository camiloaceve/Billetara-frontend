import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)]],
      confirmPassword: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]{6,10}$/)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,12}$/)]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const registerData = {
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      nombre: this.registerForm.value.nombre,
      apellido: this.registerForm.value.apellido,
      documento: this.registerForm.value.documento,
      telefono: this.registerForm.value.telefono
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: '¡Registro exitoso!',
            text: 'Por favor verifica tu email para activar la cuenta',
            confirmButtonText: 'Ir a verificar'
          }).then(() => {
            this.router.navigate(['/auth/verify-email'], {
              queryParams: { email: this.registerForm.value.email }
            });
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.message_error || 'Error al registrar usuario';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    const errors = control.errors;

    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }
    if (errors['pattern']) {
      switch (controlName) {
        case 'password':
          return 'La contraseña debe contener al menos una letra y un número';
        case 'documento':
          return 'Documento inválido (6-10 dígitos)';
        case 'telefono':
          return 'Teléfono inválido (10-12 dígitos)';
        default:
          return 'Formato inválido';
      }
    }
    return 'Campo inválido';
  }

  // Getters
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get nombre() { return this.registerForm.get('nombre'); }
  get apellido() { return this.registerForm.get('apellido'); }
  get documento() { return this.registerForm.get('documento'); }
  get telefono() { return this.registerForm.get('telefono'); }

}
