import { Component, signal, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

interface LeaderboardEntry {
  userId: number;
  username: string;
  status?: string;
  progress: number;
  message: string;
  messageTargetedUsername: string | null;
  isCurrentUser: boolean;
  hasRecentCommit: boolean;
  hasRecentPromotion: boolean;
}

@Component({
  selector: 'app-leaderboard',
  imports: [TableModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;
  private refreshHandler = () => this.loadLeaderboard();

  protected readonly leaderboardData = signal<LeaderboardEntry[]>([]);
  protected readonly isLoading = signal(false);

  constructor() {
    // When the user logs out, switch to demo data immediately
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (!loggedIn) {
        this.loadLeaderboard();
      }
    });
  }

  ngOnInit(): void {
    this.loadLeaderboard();
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => this.loadLeaderboard(), 30000);
    // Listen for manual refresh events
    window.addEventListener('quitzz:refresh', this.refreshHandler);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    window.removeEventListener('quitzz:refresh', this.refreshHandler);
  }

  private async loadLeaderboard(): Promise<void> {
    if (!this.authService.isLoggedIn()) {
      // Show demo data when not logged in
      this.leaderboardData.set([
        { userId: 0, username: 'You', status: 'Strong', progress: 85, message: 'MOTIVATION_1', messageTargetedUsername: null, isCurrentUser: true, hasRecentCommit: true, hasRecentPromotion: false },
        { userId: 1, username: 'Alex_92', status: 'Focused', progress: 92, message: 'ENCOURAGEMENT_0', messageTargetedUsername: 'You', isCurrentUser: false, hasRecentCommit: false, hasRecentPromotion: true },
        { userId: 2, username: 'NeoDream', progress: 78, message: 'POSITIVE_2', messageTargetedUsername: null, isCurrentUser: false, hasRecentCommit: true, hasRecentPromotion: false },
        { userId: 3, username: 'Mike_T', status: 'Determined', progress: 65, message: '', messageTargetedUsername: null, isCurrentUser: false, hasRecentCommit: false, hasRecentPromotion: false },
        { userId: 4, username: 'sky-cloud-', progress: 88, message: 'MOTIVATION_0', messageTargetedUsername: null, isCurrentUser: false, hasRecentCommit: true, hasRecentPromotion: false },
      ]);
      return;
    }

    this.isLoading.set(true);
    try {
      const groupData = await firstValueFrom(this.apiService.getGroupMembers());
      const currentUserId = this.authService.user()?.id;

      // Transform group members into leaderboard entries
      const entries: LeaderboardEntry[] = groupData.members.map((member: any) => ({
        userId: member.id,
        username: member.id === currentUserId ? 'You' : member.username,
        status: member.status || undefined,
        progress: Math.round((member.progressScore || 0) * 100),
        message: member.latestMessage || '',
        messageTargetedUsername: member.latestMessageTargetedUsername
          ? (member.latestMessageTargetedUserId === currentUserId ? 'You' : member.latestMessageTargetedUsername)
          : null,
        isCurrentUser: member.id === currentUserId,
        hasRecentCommit: member.hasRecentCommit || false,
        hasRecentPromotion: member.hasRecentPromotion || false,
      }));

      // Sort by progress (highest first), with current user highlighted
      entries.sort((a, b) => b.progress - a.progress);

      this.leaderboardData.set(entries);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  formatMessage(messageType: string): string {
    const messages: Record<string, string> = {
      'ENCOURAGEMENT_0': 'You got this! 💪',
      'ENCOURAGEMENT_1': 'Stay strong! 🌟',
      'ENCOURAGEMENT_2': 'Keep pushing! 🚀',
      'MOTIVATION_0': 'One day at a time',
      'MOTIVATION_1': "Let's go",
      'MOTIVATION_2': 'Future is bright',
      'POSITIVE_0': 'Lock in',
      'POSITIVE_1': 'Ready for war',
      'POSITIVE_2': 'Stronger than ever',
    };
    return messages[messageType] || messageType;
  }
}
