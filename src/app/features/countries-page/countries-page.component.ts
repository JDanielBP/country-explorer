import { Component, DestroyRef, effect, ElementRef, inject, OnInit, viewChildren, OnDestroy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';

import { CountryCardComponent } from '../../shared/components/country-card/country-card.component';
import { SaveButtonComponent } from '../../shared/components/save-button/save-button.component';

import { debounceTime, merge, tap } from 'rxjs';
import { MenuItem } from 'primeng/api';

import { CountryService } from '../../shared/services/country/country.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';

@Component({
  selector: 'app-countries',
  imports: [
    ButtonModule,
    CommonModule,
    CountryCardComponent,
    InputGroupAddonModule,
    InputGroupModule,
    InputTextModule,
    MenuModule,
    MessageModule,
    PopoverModule,
    ProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule,
    SaveButtonComponent,
    SelectModule,
    TableModule,
    ToggleButtonModule,
    TooltipModule
  ],
  templateUrl: './countries-page.component.html',
  styleUrl: './countries-page.component.scss'
})
export class CountriesPageComponent implements OnInit, OnDestroy {
  loading = true;
  loadingSearch = false;
  error = false;
  view: 'table' | 'th-large' = 'th-large';

  pageIndex = 0;
  pageSize = 10;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lastElement!: ElementRef<any>;
  countries: Country[] = [];
  filteredCountries: Country[] = [];
  lazyLoadingCountries: Country[] = [];

  search = new FormControl('');
  region = new FormControl('');
  order = new FormControl('official-name-asc');

  items: MenuItem[] = [];

  regions: {
    value: string;
    label: string;
  }[] = [];

  observer!: IntersectionObserver;

  cardObserver = viewChildren<ElementRef>('cardObserver');
  tableObserver = viewChildren<ElementRef>('tableObserver');

  private countryService = inject(CountryService);
  private destroyRef = inject(DestroyRef);
  private titleService = inject(TitleService);
  private router = inject(Router);

  constructor() {
    this.initData();
    effect(() => {
      this.toggleObserver();
    });
  }

  ngOnInit() {
    this.titleService.title = 'Listado de países';

    this.countryService.getCountries().subscribe({
      next: countries => {
        this.countries = countries;
        this.filteredCountries = JSON.parse(JSON.stringify(this.countries));
        this.loading = false;

        this.orderBy(this.order.value!);
        this.addMoreCountries();
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });

    merge(this.search.valueChanges, this.region.valueChanges, this.order.valueChanges)
      .pipe(
        tap(() => {
          this.loadingSearch = true;
        }),
        debounceTime(300), // Simulación de carga
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadingSearch = false;
        this.filteredCountries = this.countries.filter(
          c =>
            (c.translations?.['spa'].common.toLowerCase().includes(this.search.value?.toLowerCase() ?? '') ||
              c.translations?.['spa'].official.toLowerCase().includes(this.search.value?.toLowerCase() ?? '') ||
              c.capital?.some(cap => cap.toLowerCase().includes(this.search.value?.toLowerCase() ?? '')) ||
              c.cca3.includes(this.search.value?.toLowerCase() ?? '')) &&
            c.region.toLowerCase().includes(this.region.value?.toLowerCase() ?? '')
        );

        this.orderBy(this.order.value!);
        this.lazyLoadingCountries = [];
        this.addMoreCountries();
      });
  }

  addMoreCountries() {
    this.lazyLoadingCountries.push(
      ...this.filteredCountries.slice(this.pageIndex * this.pageSize, this.pageIndex * this.pageSize + this.pageSize)
    );
    this.pageIndex++;
  }

  toggleView() {
    this.view = this.view === 'table' ? 'th-large' : 'table';
    this.toggleObserver();
  }

  toggleObserver() {
    if (this.lastElement && this.lastElement.nativeElement) this.observer.unobserve(this.lastElement.nativeElement);

    if (this.view === 'table') this.lastElement = this.tableObserver()[this.tableObserver().length - 1];
    else this.lastElement = this.cardObserver()[this.cardObserver().length - 1];

    if (this.lastElement && this.lastElement.nativeElement) this.observer.observe(this.lastElement.nativeElement);
  }

  resetInput() {
    this.search.setValue('');
  }

  orderBy(order: string) {
    this.filteredCountries.sort((a, b) => {
      switch (order) {
        case 'official-name-asc':
          return a.translations?.['spa'].official.localeCompare(b.translations?.['spa'].official);
        case 'official-name-desc':
          return b.translations?.['spa'].official.localeCompare(a.translations?.['spa'].official);
        case 'common-name-asc':
          return a.translations?.['spa'].common.localeCompare(b.translations?.['spa'].common);
        case 'common-name-desc':
          return b.translations?.['spa'].common.localeCompare(a.translations?.['spa'].common);
        case 'capital-asc': {
          if (!a.capital[0]) return 1;
          else if (!b.capital[0]) return -1;
          else return (a.capital[0] ?? '').localeCompare(b.capital[0] ?? '');
        }
        case 'capital-desc':
          return (b.capital[0] ?? '').localeCompare(a.capital[0] ?? '');
        case 'population-asc':
          return a.population - b.population;
        case 'population-desc':
          return b.population - a.population;
        case 'area-asc':
          return a.area - b.area;
        case 'area-desc':
          return b.area - a.area;
        default:
          return 0;
      }
    });
  }

  onCountrySelected(cca3: string) {
    this.router.navigate(['/countries', cca3]);
  }

  initData() {
    this.items = [
      {
        label: 'Ordernar por',
        items: [
          {
            label: 'Nombre oficial (A - Z)',
            icon: 'pi pi-sort-up',
            command: () => this.order.setValue('official-name-asc')
          },
          {
            label: 'Nombre oficial (Z -A)',
            icon: 'pi pi-sort-down',
            command: () => this.order.setValue('official-name-desc')
          },
          {
            label: 'Nombre común (A - Z)',
            icon: 'pi pi-sort-up',
            command: () => this.order.setValue('common-name-asc')
          },
          {
            label: 'Nombre común (Z - A)',
            icon: 'pi pi-sort-down',
            command: () => this.order.setValue('common-name-desc')
          },
          {
            label: 'Capital (A - Z)',
            icon: 'pi pi-sort-up',
            command: () => this.order.setValue('capital-asc')
          },
          {
            label: 'Capital (Z - A)',
            icon: 'pi pi-sort-down',
            command: () => this.order.setValue('capital-desc')
          },
          {
            label: 'Mayor población',
            icon: 'pi pi-sort-up',
            command: () => this.order.setValue('population-desc')
          },
          {
            label: 'Menor población',
            icon: 'pi pi-sort-down',
            command: () => this.order.setValue('population-asc')
          },
          {
            label: 'Mayor área',
            icon: 'pi pi-sort-up',
            command: () => this.order.setValue('area-desc')
          },
          {
            label: 'Menor área',
            icon: 'pi pi-sort-down',
            command: () => this.order.setValue('area-asc')
          }
        ]
      }
    ];

    this.regions = [
      { value: 'Africa', label: 'África' },
      { value: 'Americas', label: 'América' },
      { value: 'Asia', label: 'Asia' },
      { value: 'Europe', label: 'Europa' },
      { value: 'Oceania', label: 'Oceanía' },
      { value: 'Antarctic', label: 'Antártida' }
    ];

    this.observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          this.observer.unobserve(entries[0].target);
          this.addMoreCountries();
        }
        if (this.lazyLoadingCountries.length >= this.filteredCountries.length) {
          this.observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0
      }
    );
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
