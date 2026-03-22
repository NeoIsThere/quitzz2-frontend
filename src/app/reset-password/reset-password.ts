import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  protected error = signal<string | null>(null);
  protected success = signal(false);
  protected token = '';

  protected newPassword = '';
  protected confirmPassword = '';

  constructor(
    protected authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error.set('Invalid reset link. Please request a new one.');
    }
  }

  onReset(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.newPassword.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    if (!/[a-zA-Z]/.test(this.newPassword)) {
      this.error.set('Password must contain at least one letter');
      return;
    }

    if (!/\d/.test(this.newPassword)) {
      this.error.set('Password must contain at least one number');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    this.error.set(null);
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.success.set(true);
      },
      error: (err) => {
        const validationErrors: { msg: string }[] | undefined = err.error?.errors;
        if (validationErrors?.length) {
          this.error.set(validationErrors.map(e => e.msg).join(' · '));
        } else {
          this.error.set(err.error?.error || 'Failed to reset password. Please try again.');
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }
}
