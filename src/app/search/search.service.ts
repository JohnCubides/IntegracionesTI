import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    private resultsSubject = new BehaviorSubject<any[]>([]);
    results$ = this.resultsSubject.asObservable();

    private baseUrl = 'https://almsearch.dev.azure.com';
    private organization = 'ColsubsidioDigital';
    private project = 'Integraciones TI';

    constructor(private http: HttpClient) { }

    private getAuthHeaders(): HttpHeaders {
        const pat = environment.pat;
        const username = 'johncubcub@colsubsidio.com';
        const encoded = btoa(`${username}:${pat}`);

        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Basic ${encoded}`,
        });
    }

    searchWorkItems(query: string) {
        const body = {
            searchText: query,
            $top: 1000,
            filters: null,
        };

        const url = `${this.baseUrl}/${this.organization}/${this.project}/_apis/search/workitemsearchresults?api-version=7.1-preview.1`;

        this.http.post<any>(url, body, { headers: this.getAuthHeaders() }).subscribe({
            next: (response) => {
                const results = response.results || [];
                this.resultsSubject.next(results);
            },
            error: (err) => {
                console.error('Error en la búsqueda:', err);
            },
        });
    }

    getWorkItemDetail(id: number) {
        const fields = [
            'System.AssignedTo',
            'System.Tags',
            'System.Rev',
            'System.CreatedDate',
            'System.ChangedDate',
            'System.CreatedBy',
            'Custom.EndpointOrigen',
            'Custom.ApiProxy',
            'Custom.217e3276-d5f7-4d7a-9b46-62b228cc70ef',
            'Custom.UESDestino',
            'Custom.ClienteDestino',
            'Custom.kvm',
            'Custom.targetServer',
            'Custom.Mapeos'
        ];
        const fieldParams = fields.join(',');
        const url = `https://dev.azure.com/${this.organization}/_apis/wit/workitems/${id}?fields=${fieldParams}&api-version=7.1-preview.3`;
        return this.http.get<any>(url, { headers: this.getAuthHeaders() });
    }
}