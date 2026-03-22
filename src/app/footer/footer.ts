import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected router = inject(Router);

  get isAuthPage(): boolean {
    return this.router.url.startsWith('/auth') || this.router.url.startsWith('/reset-password');
  }
}
