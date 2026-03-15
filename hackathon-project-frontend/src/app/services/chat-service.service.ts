// chat-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  message: string;
  from: 'user' | 'ai';
  id?: number; // optional for database
}

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

  private apiUrl = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) { }

  
addMessage(user_id: string, message: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/add`, { user_id, message });
}

addMessage2(user_id: string, message: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/add2`, { user_id, message });
}

  getChatHistory(user_id: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${user_id}`);
  }
   sendPolygonEmail(email: string, area: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-polygon`, { email, area }); // Send both email and area
  }
}
