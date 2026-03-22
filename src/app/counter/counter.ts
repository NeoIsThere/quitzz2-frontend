import { Component, signal, computed, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { CommitButton } from '../commit-button/commit-button';
import { ApiService, StatsResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { RANKS, getRankTitle, getRankImage } from '../constants/ranks';

@Component({
  selector: 'app-counter',
  imports: [CommitButton, CommonModule],
  templateUrl: './counter.html',
  styleUrl: './counter.css',
})
export class Counter implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  protected authService = inject(AuthService);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private refreshHandler = () => { this.loadProgress(); this.loadStreak(); };

  protected readonly counterValue = signal(0);
  protected readonly currentStreak = signal(0);
  protected readonly currentRank = signal(0);
  protected readonly nextRank = signal<number | null>(null);
  protected readonly showRankPopup = signal(false);
  protected readonly showMilestonePopup = signal(false);
  protected readonly showInfoPopup = signal(false);
  protected readonly showCommitInfo = signal(false);
  protected readonly showStatsPopup = signal(false);
  protected readonly milestoneStreak = signal(0);
  protected readonly stats = signal<StatsResponse | null>(null);
  protected readonly statsLoading = signal(false);
  private promotionNotifIds: number[] = [];

  protected readonly rankTitle = computed(() => getRankTitle(this.currentRank()));
  protected readonly rankImage = computed(() => getRankImage(this.currentRank()));
  protected readonly nextRankTitle = computed(() => {
    const nr = this.nextRank();
    return nr !== null ? getRankTitle(nr) : null;
  });
  protected readonly nextRankImage = computed(() => {
    const nr = this.nextRank();
    return nr !== null ? getRankImage(nr) : null;
  });
  protected readonly allRanks = RANKS;

  private static readonly MOTIVATIONAL_MESSAGES = [
    'no quitting today',
    'quit tomorrow, not today',
    'you got this',
    'today is your day',
    'make today count',
    'be proud tomorrow',
    'no failure',
    'give it your 100%',
    'stay solid',
    'stronger everyday',
    'today does matter',
    'make the days count',
    'fight for freedom',
    'make it come true',
    'champion',
    'victory is a decision',
    'never back down',
  ];

  protected readonly motivationalMessage = signal('');

  private pickMotivationalMessage(): string {
    const hour = new Date().getHours();
    let greeting: string | null = null;
    if (hour >= 5 && hour < 12) greeting = 'good morning champ';
    else if (hour >= 12 && hour < 18) greeting = 'good afternoon champ';
    else if (hour >= 18 && hour < 21) greeting = 'good evening champ';
    else greeting = 'good night champ';

    const pool = [greeting, ...Counter.MOTIVATIONAL_MESSAGES];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  protected readonly strokeDashoffset = computed(() => {
    const circumference = 2 * Math.PI * 90; // r=90
    const percentage = this.counterValue();
    return circumference - (circumference * percentage) / 100;
  });

  constructor() {
    // When the user logs out, reset signals to demo values immediately
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (!loggedIn) {
        this.counterValue.set(42);
        this.currentRank.set(4);
        this.nextRank.set(5);
        this.currentStreak.set(5);
        this.stats.set(null);
        this.showRankPopup.set(false);
        this.showMilestonePopup.set(false);
        this.showInfoPopup.set(false);
        this.showStatsPopup.set(false);
        this.showCommitInfo.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.motivationalMessage.set(this.pickMotivationalMessage());
    this.loadProgress();
    this.loadStreak();
    this.checkPromotionNotification();
    window.addEventListener('quitzz:refresh', this.refreshHandler);
    this.refreshInterval = setInterval(() => {
      this.loadProgress();
      this.loadStreak();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('quitzz:refresh', this.refreshHandler);
  }

  private async loadProgress(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.counterValue.set(42);
      this.currentRank.set(4);
      this.nextRank.set(5);
      return;
    }

    try {
      const progress = await firstValueFrom(this.apiService.getProgress());
      console.log('[progress]', progress);
      this.counterValue.set(Math.round(progress.progressScore * 100));
      this.currentRank.set(progress.rank ?? 0);
      this.nextRank.set(progress.nextRank ?? null);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }

  private async checkPromotionNotification(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    try {
      const response = await firstValueFrom(this.apiService.getNotifications());
      const promoNotifs = response.notifications.filter((n: any) => n.type === 'USER_PROGRESS');
      if (promoNotifs.length > 0) {
        this.promotionNotifIds = promoNotifs.map((n: any) => n.id);
        this.showRankPopup.set(true);
      }
    } catch { }
  }

  private async loadStreak(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      this.currentStreak.set(5);
      return;
    }

    try {
      const streak = await firstValueFrom(this.apiService.getStreak());
      this.currentStreak.set(streak.currentStreak);
      if (streak.newMilestone) {
        this.milestoneStreak.set(streak.currentStreak);
        this.showMilestonePopup.set(true);
      }
    } catch (error) {
      console.error('Failed to load streak:', error);
    }
  }

  dismissRankPopup(): void {
    this.showRankPopup.set(false);
    for (const id of this.promotionNotifIds) {
      this.apiService.consumeNotification(id).subscribe();
    }
    this.promotionNotifIds = [];
  }

  dismissMilestonePopup(): void {
    this.showMilestonePopup.set(false);
  }

  toggleInfoPopup(): void {
    const opening = !this.showInfoPopup();
    this.showInfoPopup.set(opening);
    if (opening) {
      // Scroll the active rank into view after the popup renders
      setTimeout(() => {
        document.querySelector('.rank-row--active')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 50);
    }
  }

  dismissInfoPopup(): void {
    this.showInfoPopup.set(false);
  }

  toggleCommitInfo(): void {
    this.showCommitInfo.set(!this.showCommitInfo());
  }

  dismissCommitInfo(): void {
    this.showCommitInfo.set(false);
  }

  async toggleStatsPopup(): Promise<void> {
    const opening = !this.showStatsPopup();
    this.showStatsPopup.set(opening);
    if (opening && !this.stats()) {
      if (!this.authService.isLoggedIn()) {
        this.stats.set({
          longestStreak: 21,
          worstRelapseDay: 'Friday',
          worstUrgeDay: 'Sunday',
          recentEvents: [
            { type: 'COMMIT', date: new Date(Date.now() - 1 * 3600000).toISOString() },
            { type: 'URGE',   date: new Date(Date.now() - 5 * 3600000).toISOString() },
            { type: 'COMMIT', date: new Date(Date.now() - 26 * 3600000).toISOString() },
            { type: 'COMMIT', date: new Date(Date.now() - 50 * 3600000).toISOString() },
            { type: 'RELAPSE',date: new Date(Date.now() - 74 * 3600000).toISOString() },
            { type: 'COMMIT', date: new Date(Date.now() - 98 * 3600000).toISOString() },
          ],
          thisWeek:  { relapses: 0, urges: 2, commits: 5 },
          lastWeek:  { relapses: 1, urges: 4, commits: 4 },
        });
        return;
      }
      this.statsLoading.set(true);
      try {
        const data = await firstValueFrom(this.apiService.getStats());
        this.stats.set(data);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        this.statsLoading.set(false);
      }
    }
  }

  dismissStatsPopup(): void {
    this.showStatsPopup.set(false);
  }

  setValue(value: number) {
    if (value >= 0 && value <= 100) {
      this.counterValue.set(value);
    }
  }
}
