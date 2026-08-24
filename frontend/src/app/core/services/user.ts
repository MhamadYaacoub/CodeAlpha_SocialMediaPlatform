import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { User as UserModel } from './auth';

export interface DiscoverUser extends UserModel { following?: boolean; requestStatus?:string|null; }

@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private http: HttpClient) {}
  me(): Observable<{ user: UserModel }> { return this.http.get<{ user: UserModel }>(`${API_URL}/users/me`); }
  updateMe(data: { name: string; bio?: string; profileImage?: string }): Observable<{ user: UserModel }> { return this.http.patch<{ user: UserModel }>(`${API_URL}/users/me`, data); }
  list(search = ''): Observable<{ users: DiscoverUser[] }> { return this.http.get<{ users: DiscoverUser[] }>(`${API_URL}/users`, { params: { search } }); }
  profile(id: number): Observable<any> { return this.http.get(`${API_URL}/users/${id}`); }
  toggleFollow(id: number): Observable<{ following: boolean }> { return this.http.post<{ following: boolean }>(`${API_URL}/users/${id}/follow`, {}); }
  followers(id:number):Observable<any>{return this.http.get(`${API_URL}/users/${id}/followers`);}
  following(id:number):Observable<any>{return this.http.get(`${API_URL}/users/${id}/following`);}
}
