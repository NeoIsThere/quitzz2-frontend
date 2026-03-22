import { Component, inject } from '@angular/core';
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

  showFeedback = false;
  feedbackText = '';
  sendingFeedback = false;
  feedbackSuccess = false;
  feedbackError = false;

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/auth') || this.router.url.startsWith('/reset-password');
  }

  toggleFeedback(): void {
    this.showFeedback = !this.showFeedback;
    this.feedbackSuccess = false;
    this.feedbackError = false;
  }

  submitFeedback(): void {
    if (!this.feedbackText.trim()) return;
    this.sendingFeedback = true;
    this.feedbackSuccess = false;
    this.feedbackError = false;

    this.api.sendFeedback(this.feedbackText.trim()).subscribe({
      next: () => {
        this.sendingFeedback = false;
        this.feedbackSuccess = true;
        this.feedbackText = '';
        setTimeout(() => { this.showFeedback = false; this.feedbackSuccess = false; }, 3000);
      },
      error: () => {
        this.sendingFeedback = false;
        this.feedbackError = true;
      }
    });
  }
}
