import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';

export interface StatusUser {
  id: number;
  name: string;
  username: string;
  profileImage?: string | null;
}

export interface StatusItem {
  id: number;
  content?: string | null;
  imageUrl?: string | null;
  mediaUrl?:string|null;
  mediaType?:'image'|'video'|null;
  musicUrl?:string|null;
  musicTitle?:string|null;
  viewed?:boolean;
  userId: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  viewsCount?: number;
  user?: StatusUser;
}

@Injectable({
  providedIn: 'root',
})
export class Status {
  private readonly apiUrl = `${API_URL}/statuses`;

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<{ statuses: StatusItem[] }> {
    return this.http.get<{ statuses: StatusItem[] }>(this.apiUrl);
  }

  createStatus(data: { content?: string; mediaUrl?:string; mediaType?:string; musicUrl?:string; musicTitle?:string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  viewStatus(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getViewers(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/viewers`);
  }

  deleteStatus(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
