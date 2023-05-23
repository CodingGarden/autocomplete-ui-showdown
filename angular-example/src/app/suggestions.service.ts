import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  constructor(private http: HttpClient) {}

  getSuggestions(query: string) {
    return this.http.get<string[]>(`https://tree-suggestion-api.deno.dev/?filter=${query}`);
  }
}
