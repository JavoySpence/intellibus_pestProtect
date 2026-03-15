import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiServiceService {

  private baseUrl = 'http://localhost:3000/api/ai';
  private baseUrl2 = 'http://localhost:3000/api/chat';

  constructor(private http: HttpClient) { }

   // POST request to /ask
  askQuestion(prompt: string): Observable<any> {
    sessionStorage.setItem('lastPrompt', prompt);
    return this.http.post(`${this.baseUrl}/ask`, { prompt });
  }


  sendPolygonInEmail(email: string, area: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/send-polygon-email`, {
    email,
    area
  });
}

}
