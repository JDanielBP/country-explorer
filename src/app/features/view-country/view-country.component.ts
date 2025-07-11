import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Location } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';

import { CountryService } from '../../shared/services/country/country.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';
import { EMPTY_COUNTRY } from '../../core/models/empty-country.const';

@Component({
  selector: 'app-view-country',
  imports: [
    ButtonModule,
    CommonModule,
    FieldsetModule,
    MessageModule,
    ProgressSpinnerModule,
    RouterModule,
    TooltipModule
  ],
  templateUrl: './view-country.component.html',
  styleUrl: './view-country.component.scss'
})
export class ViewCountryComponent implements OnInit {
  loading = true;
  error = false;
  bgFlag = signal('');

  country: Country = EMPTY_COUNTRY;
  borderCountries: Country[] = [];
  mapUrl: SafeResourceUrl | undefined;

  bg = viewChild<ElementRef>('bg');

  private countryService = inject(CountryService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(TitleService);

  constructor() {
    effect(() => {
      const element = this.bg()?.nativeElement;
      if (element) element.style.backgroundImage = `url('${this.bgFlag()}')`;
      this.mapUrl = this.getMapUrl();
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const cca3 = params.get('id') ?? '';
      this.country = EMPTY_COUNTRY;
      this.borderCountries = [];

      //País seleccionado
      this.countryService.getCountryByCode(cca3).subscribe({
        error: () => {
          this.error = true;
          this.loading = false;
        },
        next: country => {
          this.country = country;
          this.loading = false;
          this.bgFlag.set(country.flags.svg);

          //Países fronterizos
          if (!country.borders) return;
          country.borders.forEach(borderCountry => {
            this.countryService
              .getBorderCountries(borderCountry)
              .subscribe(borderCountry => this.borderCountries.push(borderCountry));
          });
        }
      });
    });

    this.titleService.title = 'Detalle de país';
  }

  getMapUrl() {
    const url = `https://www.google.com/maps?q=${this.country.latlng[0]},${this.country.latlng[1]}&hl=es&z=6&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack() {
    this.location.back();
  }
}
