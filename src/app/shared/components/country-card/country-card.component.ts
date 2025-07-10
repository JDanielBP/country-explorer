import { Component, input } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { Country } from '../../../core/models/countries.interface';

@Component({
  selector: 'app-country-card',
  imports: [ButtonModule, CardModule, TooltipModule],
  templateUrl: './country-card.component.html',
  styleUrl: './country-card.component.scss'
})
export class CountryCardComponent {
  country = input<Country>();
}
