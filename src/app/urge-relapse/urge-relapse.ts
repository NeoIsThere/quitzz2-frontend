import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, GroupMember } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-urge-relapse',
  imports: [CommonModule, FormsModule],
  templateUrl: './urge-relapse.html',
  styleUrl: './urge-relapse.css',
})
export class UrgeRelapse implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  protected isUrgeLoading = signal(false);
  protected isRelapseLoading = signal(false);
  protected showUrgeSuccess = signal(false);
  protected showRelapseSuccess = signal(false);
  protected showRelapseAlreadyRecorded = signal(false);

  protected showRelapseConfirm = signal(false);

  // Message related
  protected isMessageLoading = signal(false);
  protected selectedMessage = signal<string | null>(null);
  protected sentMessage = signal<string | null>(null);
  protected currentMessage = signal<string | null>(null);

  // User targeting
  protected groupMembers = signal<GroupMember[]>([]);
  protected selectedTargetUserId = signal<number | null>(null);
  protected currentTargetUsername = signal<string | null>(null);

  readonly messageOptions = [
    { value: 'ENCOURAGEMENT_0', label: 'You got this! 💪' },
    { value: 'ENCOURAGEMENT_1', label: 'Stay strong 🛡️' },
    { value: 'ENCOURAGEMENT_2', label: 'Keep pushing! 🚀' },
    { value: 'MOTIVATION_0', label: 'One day at a time 🌴' },
    { value: 'MOTIVATION_1', label: "Let's go! 🔥" },
    { value: 'MOTIVATION_2', label: 'Future is bright 🌟' },
    { value: 'POSITIVE_0', label: 'Lock in ⚠️' },
    { value: 'POSITIVE_1', label: 'Ready for war ⚔️' },
    { value: 'POSITIVE_2', label: 'Stronger than ever ⚡' },
  ];

  ngOnInit(): void {
    this.loadCurrentMessage();
    this.loadGroupMembers();
  }

  private loadGroupMembers(): void {
    if (!this.authService.isLoggedIn()) return;
    this.apiService.getGroupMembers().subscribe({
      next: (response) => {
        const currentUserId = this.authService.user()?.id;
        // Exclude current user from target list
        const others = response.members.filter(m => m.id !== currentUserId);
        this.groupMembers.set(others);
      },
      error: () => {}
    });
  }

  private loadCurrentMessage(): void {
    if (!this.authService.isLoggedIn()) return;

    this.apiService.getGroupMembers().subscribe({
      next: (response) => {
        const userId = this.authService.user()?.id;
        const me = response.members.find(m => m.id === userId);
        if (me?.latestMessage) {
          this.currentMessage.set(me.latestMessage);
          this.sentMessage.set(me.latestMessage);
          this.selectedTargetUserId.set(me.latestMessageTargetedUserId ?? null);
          this.currentTargetUsername.set(me.latestMessageTargetedUsername ?? null);
        }
      },
      error: () => {}
    });
  }

  formatMessage(messageType: string): string {
    const msg = this.messageOptions.find(m => m.value === messageType);
    return msg?.label || messageType;
  }

  sendMessage(messageType: string): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.isMessageLoading()) return;

    this.isMessageLoading.set(true);
    this.selectedMessage.set(messageType);
    const targetId = this.selectedTargetUserId() ?? undefined;

    this.apiService.sendMessage(messageType, targetId).subscribe({
      next: () => {
        this.isMessageLoading.set(false);
        this.sentMessage.set(messageType);
        this.currentMessage.set(messageType);
        // Update current target username display
        if (this.selectedTargetUserId()) {
          const target = this.groupMembers().find(m => m.id === this.selectedTargetUserId());
          this.currentTargetUsername.set(target?.username ?? null);
        } else {
          this.currentTargetUsername.set(null);
        }
        this.selectedMessage.set(null);
        // Refresh leaderboard
        window.dispatchEvent(new CustomEvent('quitzz:refresh'));
      },
      error: (err) => {
        console.error('Failed to send message:', err);
        this.isMessageLoading.set(false);
        this.selectedMessage.set(null);
      }
    });
  }

  onTargetChange(value: string): void {
    this.selectedTargetUserId.set(value ? Number(value) : null);
  }
  
  onUrge() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.isUrgeLoading()) return;

    this.isUrgeLoading.set(true);

    this.apiService.reportUrge().subscribe({
      next: () => {
        this.isUrgeLoading.set(false);
        this.showUrgeSuccess.set(true);
        setTimeout(() => this.showUrgeSuccess.set(false), 2000);
        window.dispatchEvent(new CustomEvent('quitzz:refresh'));
        this.router.navigate(['/urge-advice']);
      },
      error: (err) => {
        console.error('Failed to report urge:', err);
        this.isUrgeLoading.set(false);
      }
    });
  }
  
  onRelapse() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    this.showRelapseConfirm.set(true);
  }

  dismissRelapseConfirm(): void {
    this.showRelapseConfirm.set(false);
  }

  confirmRelapse() {
    this.showRelapseConfirm.set(false);

    if (this.isRelapseLoading()) return;

    this.isRelapseLoading.set(true);

    this.apiService.reportRelapse().subscribe({
      next: (response) => {
        this.isRelapseLoading.set(false);
        if (response.alreadyRecordedToday) {
          this.showRelapseAlreadyRecorded.set(true);
          setTimeout(() => this.showRelapseAlreadyRecorded.set(false), 2000);
        } else {
          this.showRelapseSuccess.set(true);
          setTimeout(() => this.showRelapseSuccess.set(false), 2000);
        }
        window.dispatchEvent(new CustomEvent('quitzz:refresh'));
        // If challenge was failed, dispatch event with failure flag
        window.dispatchEvent(new CustomEvent('quitzz:challenge-refresh', {
          detail: { challengeFailed: response.challengeFailed || false }
        }));
      },
      error: (err) => {
        console.error('Failed to report relapse:', err);
        this.isRelapseLoading.set(false);
      }
    });
  }
}
