import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import getAutoCompleteResults from 'src/getAutoCompleteResults';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loading = false;
  debouncedValue = '';
  error = '';
  suggestions: string[] = [];
  timeoutId = 0;
  abortController = new AbortController();

  async getSuggestions(event: Event) {
    clearTimeout(this.timeoutId);
    this.abortController.abort();
    this.abortController = new AbortController();
    const { value } = (event.target as HTMLInputElement);
    this.timeoutId = window.setTimeout(async () => {
      this.suggestions = [];
      this.debouncedValue = value;
      this.loading = true;
      this.error = '';
      try {
        const results = await getAutoCompleteResults(value, this.abortController.signal);
        this.suggestions = results;
        this.loading = false;
      } catch (e) {
        const error = e as Error;
        if (error.name !== "AbortError") {
          this.error = error.message;
          this.loading = false;
        }
      }
    }, 1000);
  }
}
