import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected authService = inject(AuthService);
  protected showFaq = signal(false);

  onLogout(): void {
    this.authService.logout();
  }

  toggleFaq(): void {
    this.showFaq.set(!this.showFaq());
  }

  dismissFaq(): void {
    this.showFaq.set(false);
  }
}
