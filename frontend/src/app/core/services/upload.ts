import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
@Injectable({providedIn:'root'})
export class Upload { constructor(private http:HttpClient){} file(file:File):Observable<{url:string;mime:string}>{return this.http.post<{url:string;mime:string}>(`${API_URL}/uploads`,file,{params:new HttpParams().set('mime',file.type),headers:{'Content-Type':'application/octet-stream'}});} }
