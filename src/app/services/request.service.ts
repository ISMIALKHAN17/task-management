import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  // public global_url:any = "http://uat.technologenesis.com/public/api/";

  private baseUrl = 'https://aut.digital-dotcom.com/public/api';

  constructor(private http: HttpClient) { }

  private getToken(): string {
    const token = localStorage.getItem('bearer_token');
    return token !== null && token !== undefined ? token : '';
  }

  private getHeaders(): HttpHeaders {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${this.getToken()}`
    });
    return headers;
  }

  public get(endpoint: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.baseUrl}/${endpoint}`, { headers });
  }

  public post(endpoint: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  public put(endpoint: string, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.baseUrl}/${endpoint}`, data, { headers });
  }

  public delete(endpoint: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.baseUrl}/${endpoint}`, { headers });
  }

}
