import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

type Theme = 'light-mode' | 'dark-mode';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {
  private theme = new BehaviorSubject<Theme>('light-mode');
  theme$ = this.theme.asObservable();

  constructor() {
    const theme = localStorage.getItem('theme') as Theme;
    if (theme) {
      this.theme.next(theme);
    } else {
      this.theme.next('light-mode');
      localStorage.setItem('theme', this.theme.getValue());
    }
    document.querySelector('html')?.classList.add(this.theme.getValue());
  }

  get _theme() {
    return this.theme.getValue();
  }

  toggleTheme() {
    const element = document.querySelector('html')!;
    this.theme.next(this.theme.getValue() === 'light-mode' ? 'dark-mode' : 'light-mode');
    element.classList.toggle('dark-mode');
    element.classList.toggle('light-mode');
    localStorage.setItem('theme', this.theme.getValue());
  }
}
