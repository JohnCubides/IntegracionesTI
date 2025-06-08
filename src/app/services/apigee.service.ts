import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApigeeKvmResponse {
  encrypted: boolean;
  name: string;
  entry: Array<{ name: string; value: string }>;
}

export interface ApigeeTargetServer {
  name: string;
  host: string;
  port: number;
}

@Injectable({
  providedIn: 'root'
})

export class ApigeeService {
  private baseUrl = 'https://api.enterprise.apigee.com';
  private organization = 'colsubsidio';
  private env = 'test';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const username = 'monitoreoti@colsubsidio.com';
    const password = environment.apigeePw;
    const credentials = btoa(`${username}:${password}`);
    return new HttpHeaders({
      Authorization: `Basic ${credentials}`
    });
  }

  getFullKvm(kvmName: string): Observable<ApigeeKvmResponse> {
    const url = `${this.baseUrl}/v1/organizations/${this.organization}/environments/${this.env}/keyvaluemaps/${kvmName}`;
    return this.http.get<ApigeeKvmResponse>(url, {
      headers: this.getAuthHeaders()
    });
  }

  getTargetServer(targetServer: string): Observable<ApigeeTargetServer> {
    const url = `${this.baseUrl}/v1/organizations/${this.organization}/environments/${this.env}/targetservers/${targetServer}`;
    return this.http.get<ApigeeTargetServer>(url, {
      headers: this.getAuthHeaders()
    });
  }
}
