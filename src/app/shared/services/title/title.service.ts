import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  titleSubject = new BehaviorSubject<string>('');
  title$ = this.titleSubject.asObservable();

  set title(value: string) {
    this.titleSubject.next(value);
    document.title = 'Country Explorer: ' + value;
  }
}
