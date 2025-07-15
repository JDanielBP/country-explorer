import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { SaveButtonComponent } from '../save-button/save-button.component';

import { Country } from '../../../core/models/countries.interface';

import { EMPTY_COUNTRY } from '../../../core/models/empty-country.const';

@Component({
  selector: 'app-country-card',
  imports: [ButtonModule, CardModule, CommonModule, SaveButtonComponent, TooltipModule],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss'
})
export class CountryCardComponent {
  country = input<Country>(EMPTY_COUNTRY);
  stroke = input<boolean>(true);

  deletedCountry = output<string>();

  private router = inject(Router);

  onCountrySelected() {
    this.router.navigate(['/countries', this.country().cca3]);
  }

  onDeletedCountry() {
    this.deletedCountry.emit(this.country().cca3);
  }
}
