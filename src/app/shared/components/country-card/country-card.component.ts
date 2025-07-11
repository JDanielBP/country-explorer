import { Component, inject, input, output, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { Country } from '../../../core/models/countries.interface';

@Component({
  selector: 'app-country-card',
  imports: [ButtonModule, CardModule, TooltipModule],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss'
})
export class CountryCardComponent implements OnInit {
  fillIcon = '';

  country = input<Country>();
  selectedCountry = output<string>();
  deletedCountry = output<string>();

  private messageService = inject(MessageService);

  ngOnInit() {
    const favorites = this.getFavorites();
    const exists = favorites.find(f => f === this.country()!.cca3);

    if (exists) {
      this.fillIcon = '-fill';
    }
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') ?? '[]') as string[];
  }

  isFavorite() {
    return this.fillIcon.includes('-fill');
  }

  onCountrySelected() {
    this.selectedCountry.emit(this.country()!.cca3);
  }

  onCountrySaved() {
    this.messageService.clear();
    let favorites = this.getFavorites();

    const exists = favorites.find(f => f === this.country()!.cca3);

    // Si existe, se elimina
    if (exists) {
      favorites = favorites.filter(f => f !== this.country()!.cca3);
      localStorage.setItem('favorites', JSON.stringify(favorites));

      this.fillIcon = '';
      this.deletedCountry.emit(this.country()!.cca3);

      return this.messageService.add({
        severity: 'error',
        summary: 'País eliminado de favoritos'
      });
    }

    // Si no existe, se agrega
    else {
      if (favorites) {
        localStorage.setItem('favorites', JSON.stringify([...favorites, this.country()!.cca3]));
      } else {
        localStorage.setItem('favorites', JSON.stringify([this.country()!.cca3]));
      }
      this.fillIcon = '-fill';

      this.messageService.add({
        severity: 'success',
        summary: 'País añádido a favoritos'
      });
    }
  }
}
