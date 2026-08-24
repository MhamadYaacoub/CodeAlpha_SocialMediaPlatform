import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';

export interface PostUser { id: number; name: string; username: string; profileImage?: string | null; following?:boolean; requestStatus?:string|null; }
export interface PostItem { id: number; content: string; imageUrl?: string | null; mediaUrl?:string|null; mediaType?:'image'|'video'|null; musicUrl?:string|null; musicTitle?:string|null; userId: number; createdAt: string; updatedAt: string; user: PostUser; likesCount: number; commentsCount: number; liked: boolean; }
export interface CommentItem { id: number; content: string; userId: number; postId: number; createdAt: string; user: PostUser; }

@Injectable({
  providedIn: 'root',
})
export class Post {
  constructor(private http: HttpClient) {}
  getPosts(): Observable<{ posts: PostItem[] }> { return this.http.get<{ posts: PostItem[] }>(`${API_URL}/posts`); }
  createPost(data: { content: string; mediaUrl?:string; mediaType?:string; musicUrl?:string; musicTitle?:string }): Observable<{ post: PostItem }> { return this.http.post<{ post: PostItem }>(`${API_URL}/posts`, data); }
  updatePost(id: number, data: { content: string; imageUrl?: string | null }): Observable<any> { return this.http.put(`${API_URL}/posts/${id}`, data); }
  deletePost(id: number): Observable<any> { return this.http.delete(`${API_URL}/posts/${id}`); }
  setLike(id: number, liked:boolean): Observable<{ liked: boolean; likesCount:number }> { return this.http.put<{ liked: boolean; likesCount:number }>(`${API_URL}/posts/${id}/like`, { liked }); }
  getComments(id: number): Observable<{ comments: CommentItem[] }> { return this.http.get<{ comments: CommentItem[] }>(`${API_URL}/posts/${id}/comments`); }
  addComment(id: number, content: string): Observable<{ comment: CommentItem }> { return this.http.post<{ comment: CommentItem }>(`${API_URL}/posts/${id}/comments`, { content }); }
  deleteComment(id: number): Observable<any> { return this.http.delete(`${API_URL}/comments/${id}`); }
}
