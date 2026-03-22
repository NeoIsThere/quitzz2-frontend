import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  groupId: number;
  progressScore: number;
  ewmaRelapse: number;
  ewmaUrge: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  currentStreak: number;
  estimatedRelapses: number;
  relapseFrequencyUnit: 'day' | 'week' | 'month';
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'quitzz_token';
  private readonly USER_KEY = 'quitzz_user';

  private readonly _user = signal<User | null>(null);
  private readonly _isLoading = signal(false);

  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this._user.set(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  private storeAuth(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        this.storeAuth(response.token, response.user);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    this._isLoading.set(true);
    
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap(response => {
        this.storeAuth(response.token, response.user);
        this._isLoading.set(false);
      }),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.clearStorage();
    this._user.set(null);
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<string> {
    const currentToken = this.getToken();
    return this.http.post<{ token: string }>(`${this.API_URL}/auth/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    }).pipe(
      map(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        return response.token;
      })
    );
  }

  refreshUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._user.set(user);
      })
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    this._isLoading.set(true);
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, { email }).pipe(
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    this._isLoading.set(true);
    return this.http.post<{ message: string }>(`${this.API_URL}/auth/reset-password`, { token, password }).pipe(
      tap(() => this._isLoading.set(false)),
      catchError(error => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }
}
