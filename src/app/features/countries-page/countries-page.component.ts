import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router, RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';

import { debounceTime, map, merge } from 'rxjs';

import { CountryService } from '../../shared/services/country/country.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';

interface Entity {
  value: string;
  type: string;
}

@Component({
  selector: 'app-countries',
  imports: [
    ButtonModule,
    CountryCardComponent,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule,
    SelectModule,
    TooltipModule
  ],
  templateUrl: './countries-page.component.html',
  styleUrl: './countries-page.component.scss'
})
export class CountriesPageComponent implements OnInit {
  loading = true;
  error = false;

  countries: Country[] = [];
  filteredCountries: Country[] = [];

  search = new FormControl('');
  region = new FormControl('');

  regions = [
    { value: 'Africa', label: 'África' },
    { value: 'Americas', label: 'América' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Europe', label: 'Europa' },
    { value: 'Oceania', label: 'Oceanía' }
  ];

  private destroyRef = inject(DestroyRef);
  private titleService = inject(TitleService);
  private countryService = inject(CountryService);
  private router = inject(Router);

  ngOnInit() {
    this.titleService.title = 'Listado de países';

    this.countryService.getCountries().subscribe({
      next: countries => {
        this.countries = countries;
        this.filteredCountries = JSON.parse(JSON.stringify(countries));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });

    merge(
      this.search.valueChanges.pipe(map(value => ({ value, type: 'name' }) as Entity)),
      this.region.valueChanges.pipe(map(value => ({ value, type: 'region' }) as Entity))
    )
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.filteredCountries = this.countries.filter(
          c =>
            (c.translations?.['spa'].common.toLowerCase().includes(this.search.value?.toLowerCase() ?? '') ||
              c.translations?.['spa'].official.toLowerCase().includes(this.search.value?.toLowerCase() ?? '')) &&
            c.region.toLowerCase().includes(this.region.value?.toLowerCase() ?? '')
        );
      });
  }

  resetInput() {
    this.search.setValue('');
  }

  selectedCountry(cca3: string) {
    this.router.navigate(['/countries', cca3]);
  }
}
