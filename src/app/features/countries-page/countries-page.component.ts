import { Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Popover, PopoverModule } from 'primeng/popover';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';

import { debounceTime, map, merge, tap } from 'rxjs';

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
    PopoverModule,
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
  loadingSearch = false;
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

  op = viewChild<Popover>('op');

  private destroyRef = inject(DestroyRef);
  private titleService = inject(TitleService);
  private countryService = inject(CountryService);

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
      .pipe(
        tap(() => {
          this.loadingSearch = true;
        }),
        debounceTime(300), // Simulación de carga
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadingSearch = false;
        this.filteredCountries = this.countries.filter(
          c =>
            (c.translations?.['spa'].common.toLowerCase().includes(this.search.value?.toLowerCase() ?? '') ||
              c.translations?.['spa'].official.toLowerCase().includes(this.search.value?.toLowerCase() ?? '') ||
              c.capital?.some(cap => cap.toLowerCase().includes(this.search.value?.toLowerCase() ?? '')) ||
              c.cca3.includes(this.search.value?.toLowerCase() ?? '')) &&
            c.region.toLowerCase().includes(this.region.value?.toLowerCase() ?? '')
        );
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toggle(e: any) {
    this.op()?.toggle(e);
  }

  hide() {
    this.op()?.hide();
  }

  resetInput() {
    this.search.setValue('');
  }
}
