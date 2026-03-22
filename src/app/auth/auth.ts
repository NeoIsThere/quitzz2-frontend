import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type AuthMode = 'login' | 'register' | 'forgot-password';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth {
  protected mode = signal<AuthMode>('login');
  protected error = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  
  // Login form
  protected loginEmail = '';
  protected loginPassword = '';

  // Forgot password form
  protected forgotPasswordEmail = '';
  
  // Register form
  protected registerUsername = '';
  protected registerEmail = '';
  protected registerPassword = '';
  protected registerConfirmPassword = '';
  protected currentStreak = 0;
  protected estimatedRelapses = 7;
  protected relapseFrequencyUnit: 'day' | 'week' | 'month' = 'week';

  constructor(
    protected authService: AuthService,
    private router: Router
  ) {}

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(null);
    this.successMessage.set(null);
  }

  showForgotPassword(): void {
    this.mode.set('forgot-password');
    this.error.set(null);
    this.successMessage.set(null);
  }

  backToLogin(): void {
    this.mode.set('login');
    this.error.set(null);
    this.successMessage.set(null);
  }

  onForgotPassword(): void {
    if (!this.forgotPasswordEmail) {
      this.error.set('Please enter your email');
      return;
    }

    this.error.set(null);
    this.successMessage.set(null);
    this.authService.forgotPassword(this.forgotPasswordEmail).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Something went wrong. Please try again.');
      }
    });
  }

  onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.error.set(null);
    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Login failed. Please try again.');
      }
    });
  }

  onRegister(): void {
    if (!this.registerUsername || !this.registerEmail || !this.registerPassword) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.registerUsername.length < 3 || this.registerUsername.length > 20) {
      this.error.set('Username must be between 3 and 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(this.registerUsername)) {
      this.error.set('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerEmail)) {
      this.error.set('Please enter a valid email address');
      return;
    }

    if (this.registerPassword.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    if (!/[a-zA-Z]/.test(this.registerPassword)) {
      this.error.set('Password must contain at least one letter');
      return;
    }

    if (!/\d/.test(this.registerPassword)) {
      this.error.set('Password must contain at least one number');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    if (this.currentStreak < 0 || !Number.isInteger(this.currentStreak)) {
      this.error.set('Current streak must be a whole number of 0 or more');
      return;
    }

    this.error.set(null);
    this.authService.register({
      username: this.registerUsername,
      email: this.registerEmail,
      password: this.registerPassword,
      currentStreak: this.currentStreak,
      estimatedRelapses: this.estimatedRelapses,
      relapseFrequencyUnit: this.relapseFrequencyUnit
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        // express-validator returns { errors: [{msg, path}] }
        // single backend errors return { error: 'message' }
        const validationErrors: { msg: string }[] | undefined = err.error?.errors;
        if (validationErrors?.length) {
          this.error.set(validationErrors.map(e => e.msg).join(' · '));
        } else {
          this.error.set(err.error?.error || 'Registration failed. Please try again.');
        }
      }
    });
  }
}
