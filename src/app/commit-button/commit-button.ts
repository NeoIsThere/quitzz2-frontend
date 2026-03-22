import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-commit-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commit-button.html',
  styleUrl: './commit-button.css'
})
export class CommitButton implements OnInit {
  private apiService = inject(ApiService);
  protected authService = inject(AuthService);
  private router = inject(Router);

  protected isLoading = signal(false);
  protected showSuccess = signal(false);
  protected showPowerAnimation = signal(false);
  protected hasCommitted = signal(false);
  protected lastCommit = signal<Date | null>(null);

  ngOnInit(): void {
    this.loadLastCommit();
  }

  private loadLastCommit(): void {
    if (!this.authService.isLoggedIn()) return;

    this.apiService.getLastCommit().subscribe({
      next: (response) => {
        if (response.lastCommitDate) {
          const lastDate = new Date(response.lastCommitDate);
          this.lastCommit.set(lastDate);
          // If still within the 3h cooldown window, show committed state immediately
          const secondsElapsed = (Date.now() - lastDate.getTime()) / 1000;
          if (secondsElapsed < 10800) { // COMMIT_EXPIRY_SECONDS
            this.hasCommitted.set(true);
          }
        }
      },
      error: () => {}
    });
  }

  onCommit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.isLoading() || this.hasCommitted()) return;

    this.isLoading.set(true);
    const now = new Date();

    this.apiService.recordCommit().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showSuccess.set(true);
        this.showPowerAnimation.set(true);
        this.hasCommitted.set(true);
        this.lastCommit.set(now);

        // Dispatch event to refresh leaderboard
        window.dispatchEvent(new CustomEvent('quitzz:refresh'));

        setTimeout(() => {
          this.showSuccess.set(false);
          this.showPowerAnimation.set(false);
        }, 3000);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  get timeSinceLastCommit(): string {
    const last = this.lastCommit();
    if (!last) return '';

    const now = new Date();
    const diff = now.getTime() - last.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
