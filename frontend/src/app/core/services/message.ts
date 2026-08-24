import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';

export interface Conversation { id: number; participants: any[]; messages: any[]; unreadCount:number; updatedAt: string; }

@Injectable({
  providedIn: 'root',
})
export class Message {
  constructor(private http: HttpClient) {}
  conversations(): Observable<{ conversations: Conversation[]; unreadCount:number }> { return this.http.get<any>(`${API_URL}/conversations`); }
  start(userId: number): Observable<{ conversation: Conversation }> { return this.http.post<{ conversation: Conversation }>(`${API_URL}/conversations`, { userId }); }
  messages(id: number): Observable<{ messages: any[] }> { return this.http.get<{ messages: any[] }>(`${API_URL}/conversations/${id}/messages`); }
  send(id: number, content: string): Observable<{ data: any }> { return this.http.post<{ data: any }>(`${API_URL}/conversations/${id}/messages`, { content }); }
  read(id: number): Observable<any> { return this.http.patch(`${API_URL}/conversations/${id}/read`, {}); }
}
