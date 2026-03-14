import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  User, 
  VerifyEmailRequest,
  ResendVerificationRequest 
} from '../models/auth.models';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user_data';
  private jwtHelper = new JwtHelperService();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', credentials).pipe(
      tap(response => {
        if (response.success && response.data.access_token) {
          this.setToken(response.data.access_token);
          this.setUser(response.data.user);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService.post<RegisterResponse>('/auth/register', userData);
  }

  verifyEmail(data: VerifyEmailRequest): Observable<any> {
    return this.apiService.post('/auth/verify-email', data);
  }

  resendVerification(data: ResendVerificationRequest): Observable<any> {
    return this.apiService.post('/auth/resend-verification', data);
  }

  getProfile(): Observable<any> {
    return this.apiService.get('/auth/profile');
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    return this.apiService.put('/auth/profile', userData);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}