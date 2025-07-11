import { Component, inject, OnInit } from '@angular/core';

import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';

import { CountryService } from '../../shared/services/country/country.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';

@Component({
  selector: 'app-favorites',
  imports: [CountryCardComponent, MessageModule, ProgressSpinnerModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent implements OnInit {
  loading = true;
  error = false;

  filteredCountries: Country[] = [];

  private countryService = inject(CountryService);
  private titleService = inject(TitleService);

  ngOnInit() {
    this.titleService.title = 'Favoritos';

    this.countryService.getFavorites().subscribe({
      next: countries => {
        this.filteredCountries = countries;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  deletedCountry(cca3: string) {
    this.filteredCountries = this.filteredCountries.filter(c => c.cca3 !== cca3);
  }
}
