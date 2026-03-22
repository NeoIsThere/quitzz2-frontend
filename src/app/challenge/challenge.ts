import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ChallengeProgressResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { interval, Subscription } from 'rxjs';

type ChallengeMode = 'start' | 'ongoing' | 'victory' | 'failure';

interface QueuedNotification {
  id: number;
  type: string;
  trigger_username: string | null;
}

@Component({
  selector: 'app-challenge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './challenge.html',
  styleUrl: './challenge.css',
})
export class Challenge implements OnInit, OnDestroy {
  protected mode = signal<ChallengeMode>('start');
  protected isLoading = signal(false);
  
  // Challenge creation
  protected challengeDays = 7;
  
  // Ongoing challenge data
  protected daysResisted = signal(0);
  protected totalDays = signal(7);
  protected daysRemaining = signal(7);
  
  // Notification queue — processed one at a time, oldest first
  private notifQueue: QueuedNotification[] = [];
  protected showVictory = signal(false);
  protected showFailure = signal(false);
  protected showChallengeStarted = signal(false);
  protected challengeStarterName = signal<string | null>(null);
  protected showChallengeInfo = signal(false);
  
  private refreshSubscription?: Subscription;
  private challengeRefreshHandler = (e: Event) => this.onChallengeRefresh(e);

  constructor(
    private apiService: ApiService,
    protected authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadChallengeState();
    this.checkNotifications();
    
    // Listen for challenge refresh events from relapse
    window.addEventListener('quitzz:challenge-refresh', this.challengeRefreshHandler);
    
    // Refresh every 30 seconds
    this.refreshSubscription = interval(30000).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.loadChallengeState();
        this.checkNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    window.removeEventListener('quitzz:challenge-refresh', this.challengeRefreshHandler);
  }
  
  private onChallengeRefresh(event?: Event): void {
    if (this.authService.isLoggedIn()) {
      const customEvent = event as CustomEvent;
      if (customEvent?.detail?.challengeFailed) {
        // Immediately show failure UI without waiting for server
        this.showFailure.set(true);
        this.mode.set('failure');
      } else {
        this.loadChallengeState();
        this.checkNotifications();
      }
    }
  }

  private loadChallengeState(): void {
    if (!this.authService.isLoggedIn()) return;

    this.apiService.getChallengeProgress().subscribe({
      next: (response) => {
        if (response.hasActiveChallenge && response.progress) {
          if (!this.showVictory() && !this.showFailure()) {
            this.mode.set('ongoing');
          }
          this.daysResisted.set(response.progress.daysElapsed);
          this.totalDays.set(response.progress.totalDays);
          this.daysRemaining.set(response.progress.daysRemaining);
        } else if (!this.showVictory() && !this.showFailure()) {
          this.mode.set('start');
        }
      },
      error: () => {
        this.mode.set('start');
      }
    });
  }

  /**
   * Fetch all challenge notifications, build a queue sorted oldest-first,
   * and show the first one. Subsequent ones are shown as each is dismissed.
   */
  private checkNotifications(): void {
    if (!this.authService.isLoggedIn()) return;
    // Don't reload if already showing a notification
    if (this.showVictory() || this.showFailure() || this.showChallengeStarted()) return;

    this.apiService.getChallengeNotifications().subscribe({
      next: (response) => {
        const currentUsername = this.authService.user()?.username;

        // Build queue: all notifications in chronological order (server returns ASC)
        // Filter out CHALLENGE_STARTED from self
        this.notifQueue = response.notifications
          .filter(n => !(n.type === 'CHALLENGE_STARTED' && n.trigger_username === currentUsername))
          .map(n => ({ id: n.id, type: n.type, trigger_username: n.trigger_username }));

        // Consume self-started notifications immediately (don't show them)
        const selfStarted = response.notifications
          .filter(n => n.type === 'CHALLENGE_STARTED' && n.trigger_username === currentUsername);
        for (const n of selfStarted) {
          this.apiService.consumeNotification(n.id).subscribe();
        }

        this.showNextNotification();
      }
    });
  }

  /**
   * Show the first notification in the queue (if any).
   * If queue is empty, just refresh challenge state.
   */
  private showNextNotification(): void {
    if (this.notifQueue.length === 0) {
      this.loadChallengeState();
      return;
    }

    const notif = this.notifQueue[0];

    if (notif.type === 'CHALLENGE_COMPLETE') {
      this.showVictory.set(true);
      this.mode.set('victory');
    } else if (notif.type === 'CHALLENGE_FAILED') {
      this.showFailure.set(true);
      this.mode.set('failure');
    } else if (notif.type === 'CHALLENGE_STARTED') {
      this.challengeStarterName.set(notif.trigger_username);
      this.showChallengeStarted.set(true);
    }
  }

  /**
   * Consume the current (first) notification, remove from queue, and show the next.
   */
  private consumeAndAdvance(): void {
    if (this.notifQueue.length === 0) {
      this.loadChallengeState();
      return;
    }

    const notif = this.notifQueue.shift()!;
    this.apiService.consumeNotification(notif.id).subscribe({
      next: () => this.showNextNotification(),
      error: () => this.showNextNotification()
    });
  }

  get progressPercentage(): number {
    if (this.totalDays() === 0) return 0;
    return (this.daysResisted() / this.totalDays()) * 100;
  }
  
  get strokeDashoffset(): number {
    const circumference = 2 * Math.PI * 70;
    return circumference - (circumference * this.progressPercentage) / 100;
  }

  onStartChallenge(): void {
    if (this.isLoading() || !this.authService.isLoggedIn()) return;
    if (this.challengeDays < 1 || this.challengeDays > 365) return;

    this.isLoading.set(true);
    this.apiService.createChallenge(this.challengeDays).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.loadChallengeState();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  dismissVictory(): void {
    this.showVictory.set(false);
    this.consumeAndAdvance();
  }

  dismissChallengeStarted(): void {
    this.showChallengeStarted.set(false);
    this.consumeAndAdvance();
  }

  dismissFailure(): void {
    this.showFailure.set(false);
    this.consumeAndAdvance();
  }

  toggleChallengeInfo(): void {
    this.showChallengeInfo.set(!this.showChallengeInfo());
  }
}
