import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, Observable, of } from 'rxjs';

import { Country } from '../../../core/models/countries.interface';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = 'https://restcountries.com/v3.1';
  private http = inject(HttpClient);

  /**
   *
   * @returns name, capital, flags, population, translations, region, subregion, area, cca3
   */
  getCountries(): Observable<Country[]> {
    const field = 'name,capital,flags,population,translations,region,subregion,area,cca3';
    const params = new HttpParams().set('fields', field);
    return this.http.get<Country[]>(`${this.baseUrl}/all`, { params });
  }

  /**
   *
   * @returns name, capital, flags, translations, region, cca3
   */
  getFavorites(): Observable<Country[]> {
    const field = 'name,capital,flags,translations,region,cca3';

    const cca3s = JSON.parse(localStorage.getItem('favorites') || '[]') as string[];
    if (!cca3s) return of([]);

    const params = new HttpParams().set('codes', cca3s.join(',')).set('fields', field);
    return this.http.get<Country[]>(`${this.baseUrl}/alpha`, { params });
  }

  /**
   *
   * @returns All data about a country
   */
  getCountryByCode(cca3: string): Observable<Country> {
    return this.http.get<Country[]>(`${this.baseUrl}/alpha/${cca3}`).pipe(map(country => country[0]));
  }

  /**
   *
   * @returns name, flags, translations, cca3
   */
  getBorderCountries(cca3: string): Observable<Country> {
    const field = 'name,flags,translations,cca3';
    const params = new HttpParams().set('fullText', 'true').set('fields', field);
    return this.http.get<Country>(`${this.baseUrl}/alpha/${cca3}`, { params });
  }

  /**
   *
   * @returns flags, population, translations, region, subregion, languages, borders, area, cca2, cca3
   */
  getCountriesForWorldMap(): Observable<Country[]> {
    const field = 'flags,population,translations,region,subregion,languages,borders,area,cca2,cca3';
    const params = new HttpParams().set('fields', field);
    return this.http.get<Country[]>(`${this.baseUrl}/all`, { params });
  }

  /**
   *
   * @returns name, flags, translations, cca3
   */
  getAllShortInfo(): Observable<Country[]> {
    const field = 'name,flags,translations,cca3';
    const params = new HttpParams().set('fields', field);
    return this.http
      .get<Country[]>(`${this.baseUrl}/all`, { params })
      .pipe(
        map(countries =>
          countries.sort((a, b) => a.translations['spa'].common.localeCompare(b.translations['spa'].common))
        )
      );
  }
}
