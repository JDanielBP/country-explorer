import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { Country } from '../../../core/models/countries.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = 'https://restcountries.com/v3.1';
  private http = inject(HttpClient);

  /**
   *
   * @returns name, capital, flags, translations, region
   */
  getCountries(): Observable<Country[]> {
    const field = 'name,capital,flags,translations,region';
    const params = new HttpParams().set('fields', field);

    return this.http.get<Country[]>(`${this.baseUrl}/all`, { params });
  }
}
