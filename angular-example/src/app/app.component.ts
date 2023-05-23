import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { fromEvent, of, Subscription } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { SuggestionsService } from 'src/app/suggestions.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('tree') tree!: ElementRef;
  loading = false;
  debouncedValue = '';
  error = '';
  suggestions: string[] = [];
  inputSubscription: Subscription | null = null;

  constructor(private suggestionsService: SuggestionsService) {}

  subscribeTreeInput() {
    this.inputSubscription = fromEvent(this.tree.nativeElement, 'input')
      .pipe(
        map(
          (event) => ((event as Event).currentTarget as HTMLInputElement).value
        ),
        debounceTime(300),
        tap((value) => {
          this.error = '';
          this.suggestions = [];
          this.debouncedValue = value;
          this.loading = true;
        }),
        switchMap((value) =>
          this.suggestionsService.getSuggestions(value).pipe(
            catchError((error) => {
              this.error = error.message;
              return of([] as string[]);
            })
          )
        ),
      )
      .subscribe((data) => {
        this.suggestions = data;
        this.loading = false;
      });
  }

  ngAfterViewInit() {
    this.subscribeTreeInput();
  }

  ngOnDestroy() {
    this.inputSubscription?.unsubscribe();
  }
}
