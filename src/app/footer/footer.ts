import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected router = inject(Router);
  private api = inject(ApiService);

  showFeedback = signal(false);
  feedbackText = signal('');
  sendingFeedback = signal(false);
  feedbackSuccess = signal(false);
  feedbackError = signal(false);

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/auth') || this.router.url.startsWith('/reset-password');
  }

  toggleFeedback(): void {
    this.showFeedback.set(!this.showFeedback());
    this.feedbackSuccess.set(false);
    this.feedbackError.set(false);
  }

  submitFeedback(): void {
    if (!this.feedbackText().trim()) return;
    this.sendingFeedback.set(true);
    this.feedbackSuccess.set(false);
    this.feedbackError.set(false);

    this.api.sendFeedback(this.feedbackText().trim()).subscribe({
      next: () => {
        this.sendingFeedback.set(false);
        this.feedbackSuccess.set(true);
        this.feedbackText.set('');
        setTimeout(() => { this.showFeedback.set(false); this.feedbackSuccess.set(false); }, 3000);
      },
      error: () => {
        this.sendingFeedback.set(false);
        this.feedbackError.set(true);
      }
    });
  }
}
