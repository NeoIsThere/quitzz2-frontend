import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Counter } from '../counter/counter';
import { Leaderboard } from '../leaderboard/leaderboard';
import { Challenge } from '../challenge/challenge';
import { UrgeRelapse } from '../urge-relapse/urge-relapse';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [Counter, Leaderboard, Challenge, UrgeRelapse, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  protected showWelcomePopup = signal(false);
  protected showJoinedPopup = signal(false);
  protected joinedUsername = signal<string | null>(null);
  protected groupDisplayId = signal<number | null>(null);
  protected totalUsers = signal<number | null>(null);
  protected onlineUsers = signal<number | null>(null);
  private welcomeNotifId: number | null = null;
  private joinedNotifIds: number[] = [];
  private joinedNotifUsernames: string[] = [];

  ngOnInit(): void {
    this.checkWelcomeNotification();
    this.loadGroupStats();
  }

  private async loadGroupStats(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    try {
      const stats = await firstValueFrom(this.apiService.getGroupStats());
      this.groupDisplayId.set(stats.groupDisplayId);
      this.totalUsers.set(stats.totalUsers);
      this.onlineUsers.set(stats.onlineUsers);
    } catch { }
  }

  private async checkWelcomeNotification(): Promise<void> {
    if (!this.authService.isLoggedIn()) return;
    try {
      const response = await firstValueFrom(this.apiService.getNotifications());
      const initNotif = response.notifications.find(n => n.type === 'USER_INIT');
      if (initNotif) {
        this.welcomeNotifId = initNotif.id;
        this.showWelcomePopup.set(true);
      }

      // Check for USER_JOINED notifications
      const joinedNotifs = response.notifications.filter(n => n.type === 'USER_JOINED');
      if (joinedNotifs.length > 0 && !initNotif) {
        this.joinedNotifIds = joinedNotifs.map(n => n.id);
        this.joinedNotifUsernames = joinedNotifs.slice(1).map(n => n.trigger_username ?? 'Someone');
        this.joinedUsername.set(joinedNotifs[0].trigger_username);
        this.showJoinedPopup.set(true);
      }
    } catch { }
  }

  dismissWelcome(): void {
    this.showWelcomePopup.set(false);
    if (this.welcomeNotifId) {
      this.apiService.consumeNotification(this.welcomeNotifId).subscribe();
    }
    // After welcome, check if joined notifs are pending
    if (this.joinedNotifIds.length > 0) {
      this.showJoinedPopup.set(true);
    }
  }

  dismissJoined(): void {
    // Consume the current (first) notification
    if (this.joinedNotifIds.length > 0) {
      const currentId = this.joinedNotifIds.shift()!;
      this.apiService.consumeNotification(currentId).subscribe();
    }

    // Show next joined notification if any remain
    if (this.joinedNotifIds.length > 0) {
      this.joinedUsername.set(this.joinedNotifUsernames.shift()!);
    } else {
      this.showJoinedPopup.set(false);
      this.joinedUsername.set(null);
    }
  }
}
