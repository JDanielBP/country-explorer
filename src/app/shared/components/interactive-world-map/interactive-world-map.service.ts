import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InteractiveWorldMapService {
  http = inject(HttpClient);

  getSvgWorldMap() {
    return this.http.get('interactive-world-map.svg', { responseType: 'text' });
  }
}
