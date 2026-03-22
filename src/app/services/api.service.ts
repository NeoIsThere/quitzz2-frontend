import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventResponse {
  message: string;
  event?: {
    id: number;
    type: string;
    date: string;
  };
  events?: {
    relapseId: number;
    urgeId: number;
    type: string;
    date: string;
  };
  progress?: {
    progressScore: number;
    ewmaRelapse: number;
    ewmaUrge: number;
  };
  challengeFailed?: boolean;
  alreadyRecordedToday?: boolean;
}

export interface ProgressResponse {
  userId: number;
  date: string;
  progressScore: number;
  ewmaRelapse: number;
  ewmaUrge: number;
  rank: number;
  nextRank: number | null;
  recomputed: boolean;
}

export interface StreakResponse {
  currentStreak: number;
  longestStreak: number;
  newMilestone: boolean;
}

export interface StatsResponse {
  longestStreak: number;
  recentEvents: { type: string; date: string }[];
  worstRelapseDay: string | null;
  worstUrgeDay: string | null;
  thisWeek: { relapses: number; urges: number; commits: number };
  lastWeek: { relapses: number; urges: number; commits: number };
}

export interface GroupMember {
  id: number;
  username: string;
  isBot: boolean;
  progressScore: number;
  ewmaUrge: number;
  ewmaRelapse: number;
  hasRecentCommit?: boolean;
  latestMessage?: string;
  latestMessageTargetedUsername?: string | null;
  latestMessageTargetedUserId?: number | null;
  status?: string;
}

export interface GroupMembersResponse {
  groupId: number;
  members: GroupMember[];
  count: number;
}

export interface Message {
  id: number;
  message: string;
  user_id: number;
  targeted_user_id: number | null;
  date: string;
  author_username: string;
  targeted_username: string | null;
}

export interface MessagesResponse {
  messages: Message[];
  count: number;
}

export interface Challenge {
  id: number;
  groupId: number;
  creationDatetime: string;
  expirationDatetime: string;
}

export interface ChallengeResponse {
  hasActiveChallenge: boolean;
  challenge: Challenge | null;
}

export interface ChallengeProgressResponse {
  hasActiveChallenge: boolean;
  progress: {
    challengeId: number;
    creationDatetime: string;
    expirationDatetime: string;
    totalDays: number;
    daysElapsed: number;
    daysRemaining: number;
  } | null;
}

export interface Notification {
  id: number;
  type: string;
  author_id: number;
  targeted_id: number | null;
  created_at: string;
  trigger_username: string | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  count: number;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Events
  reportUrge(): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.API_URL}/events/urge`, {});
  }

  reportRelapse(): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.API_URL}/events/relapse`, {});
  }

  recordCommit(): Observable<EventResponse> {
    return this.http.put<EventResponse>(`${this.API_URL}/events/commit`, {});
  }

  getLastCommit(): Observable<{ lastCommitDate: string | null; hasCommit: boolean }> {
    return this.http.get<{ lastCommitDate: string | null; hasCommit: boolean }>(`${this.API_URL}/events/last-commit`);
  }

  getEvents(): Observable<{ events: any[] }> {
    return this.http.get<{ events: any[] }>(`${this.API_URL}/events`);
  }

  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.API_URL}/events/stats`);
  }

  // Progress
  getProgress(date?: string): Observable<ProgressResponse> {
    const url = date 
      ? `${this.API_URL}/users/progress?date=${encodeURIComponent(date)}`
      : `${this.API_URL}/users/progress`;
    return this.http.get<ProgressResponse>(url);
  }

  // Streak
  getStreak(): Observable<StreakResponse> {
    return this.http.get<StreakResponse>(`${this.API_URL}/users/streak`);
  }

  // Groups
  getGroupMembers(): Observable<GroupMembersResponse> {
    return this.http.get<GroupMembersResponse>(`${this.API_URL}/groups/members`);
  }

  // Messages
  getMessages(): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.API_URL}/messages`);
  }

  sendMessage(message: string, targetedUserId?: number): Observable<any> {
    return this.http.put(`${this.API_URL}/messages`, { message, targetedUserId });
  }

  // Challenges
  getChallenge(): Observable<ChallengeResponse> {
    return this.http.get<ChallengeResponse>(`${this.API_URL}/challenges`);
  }

  createChallenge(days: number): Observable<any> {
    return this.http.post(`${this.API_URL}/challenges`, { days });
  }

  getChallengeProgress(): Observable<ChallengeProgressResponse> {
    return this.http.get<ChallengeProgressResponse>(`${this.API_URL}/challenges/progress`);
  }

  // Notifications
  getNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.API_URL}/notifications`);
  }

  getChallengeNotifications(): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(`${this.API_URL}/notifications/challenge`);
  }

  getNotificationCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.API_URL}/notifications/count`);
  }

  consumeNotification(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/notifications/${id}`);
  }

  consumeAllNotifications(): Observable<any> {
    return this.http.delete(`${this.API_URL}/notifications`);
  }

  // Feedback
  sendFeedback(text: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/feedback`, { text });
  }
}
