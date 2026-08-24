import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';

export interface NotificationItem { id:number; type:'like'|'comment'|'follow_request'|'follow_accepted'|'message'; actorId:number; actor:any; postId?:number; followRequestId?:number; conversationId?:number; readAt?:string|null; createdAt:string; requestStatus?:'pending'|'accepted'|'declined'|null; followingActor?:boolean; response?:'accept'|'decline'; followedBack?:boolean; }

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly unreadNotifications = signal(0);
  readonly unreadMessages = signal(0);
  constructor(private http: HttpClient) {}
  list(): Observable<{ notifications: NotificationItem[]; unreadCount:number }> { return this.http.get<any>(`${API_URL}/notifications`); }
  markRead(): Observable<any> { return this.http.patch(`${API_URL}/notifications/read`, {}); }
  respond(requestId:number, action:'accept'|'decline'): Observable<any> { return this.http.patch(`${API_URL}/follow-requests/${requestId}`, { action }); }
  refreshBadges(): void {
    this.list().subscribe(({ unreadCount }) => this.unreadNotifications.set(unreadCount));
    this.http.get<any>(`${API_URL}/conversations`).subscribe(({ unreadCount }) => this.unreadMessages.set(unreadCount || 0));
  }
}
