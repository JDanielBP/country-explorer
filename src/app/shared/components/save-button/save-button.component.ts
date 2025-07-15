import { Component, inject, input, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

import { Country } from '../../../core/models/countries.interface';

import { EMPTY_COUNTRY } from '../../../core/models/empty-country.const';

@Component({
  selector: 'app-save-button',
  imports: [ButtonModule, CardModule, CommonModule, TooltipModule],
  templateUrl: './save-button.component.html',
  styleUrl: './save-button.component.scss'
})
export class SaveButtonComponent implements OnInit {
  country = input<Country>(EMPTY_COUNTRY);
  stroke = input<boolean>(true);

  deletedCountry = output();

  private messageService = inject(MessageService);

  ngOnInit() {
    const favorites = this.getFavorites();
    const exists = favorites.find(f => f === this.country().cca3);
    if (exists) this.country().favorites = true;
  }

  getFavorites() {
    return JSON.parse(localStorage.getItem('favorites') ?? '[]') as string[];
  }

  isFavorite() {
    return this.country().favorites == true;
  }

  onCountrySaved() {
    this.messageService.clear();
    let favorites = this.getFavorites();

    const exists = favorites.find(f => f === this.country().cca3);

    // Si existe, se elimina
    if (exists) {
      favorites = favorites.filter(f => f !== this.country().cca3);
      localStorage.setItem('favorites', JSON.stringify(favorites));

      this.deletedCountry.emit();
      if (this.stroke()) this.country().favorites = false;

      return this.messageService.add({
        severity: 'error',
        summary: 'País eliminado de favoritos'
      });
    }

    // Si no existe, se agrega
    else {
      if (favorites) {
        localStorage.setItem('favorites', JSON.stringify([...favorites, this.country().cca3]));
      } else {
        localStorage.setItem('favorites', JSON.stringify([this.country().cca3]));
      }
      this.country().favorites = true;

      this.messageService.add({
        severity: 'success',
        summary: 'País añadido a favoritos'
      });
    }
  }
}
