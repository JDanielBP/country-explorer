import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { ChartModule, UIChart } from 'primeng/chart';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { InteractiveWorldMapComponent } from '../../shared/components/interactive-world-map/interactive-world-map.component';

import { ChartConfigService } from '../../shared/services/chart-config/chart-config.service';
import { CountryService } from '../../shared/services/country/country.service';
import { ThemesService } from '../../shared/services/themes/themes.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';
import { Continents } from '../../core/models/continents.record';

@Component({
  selector: 'app-world-map-dashboard',
  imports: [
    ButtonModule,
    ChartModule,
    CommonModule,
    InputTextModule,
    InteractiveWorldMapComponent,
    MenuModule,
    MessageModule,
    RouterModule,
    TableModule,
    TooltipModule
  ],
  templateUrl: './world-map-dashboard.component.html',
  styleUrl: './world-map-dashboard.component.scss'
})
export class WorldMapDashboardComponent implements OnInit {
  csTitle = 'Países con mayor población';
  dataCount = 10;
  theme = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  basicData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  basicOptions: any;

  bgColor: string[] = [];
  chartLabels: string[] = [];
  chartData: string[] = [];

  countries: Country[] = [];
  countriesLength = 0;
  filteredCountries: Country[] = [];
  items: MenuItem[] = [];
  highlights: Country[] = [];
  selectedCountry?: Country;

  chartComponent = viewChild<UIChart>('chart');
  countryTable = viewChild<Table<Country>>('countryTable');

  private cd = inject(ChangeDetectorRef);
  private chartConfigService = inject(ChartConfigService);
  private countryService = inject(CountryService);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private themesService = inject(ThemesService);
  private titleService = inject(TitleService);

  ngOnInit() {
    this.loadMenu();
    this.titleService.title = 'Mapa mundial';

    this.countryService.getCountriesForWorldMap().subscribe(countries => {
      this.countries = countries.map(c => ({
        ...c,
        spanishName: c.translations['spa']?.common || '' // Para poder filtrar
      }));

      this.countriesLength = this.countries.length;
      this.countries.forEach(country => (country.region = country.region.toLowerCase()));
      this.filteredCountries = JSON.parse(JSON.stringify(this.countries)) as Country[];

      this.filterBy(this.population);
    });

    this.themesService.theme$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      setTimeout(() => this.setBarOptions(), 0);
    });
  }

  scrollToSection() {
    const target = document.getElementById('more-stats');
    target?.scrollIntoView({ behavior: 'smooth' });
  }

  inputFilter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.countryTable()!.filterGlobal(value, 'contains');
  }

  getBorders(codes: string[]) {
    return codes.map(code => this.countries.find(c => c.cca3 === code));
  }

  getLanguages(languages: Record<string, string>) {
    return Object.values(languages).join(', ');
  }

  filterBy(stat: () => Country[]) {
    this.resetData();

    if (this.countriesLength > this.filteredCountries.length)
      this.filteredCountries = JSON.parse(JSON.stringify(this.countries)) as Country[];

    const top = stat();
    this.highlights = top;
    this.setBarData();
  }

  population = () => {
    const top5 = this.filteredCountries.sort((a, b) => b.population - a.population).slice(0, this.dataCount);
    top5.forEach(country => {
      this.chartLabels.push(country.translations['spa'].common);
      this.chartData.push(country.population.toString());
    });
    return top5;
  };

  area = () => {
    const top5 = this.filteredCountries.sort((a, b) => b.area - a.area).slice(0, this.dataCount);
    top5.forEach(country => {
      this.chartLabels.push(country.translations['spa'].common);
      this.chartData.push(country.area.toString());
    });
    return top5;
  };

  density = () => {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn',
      summary: 'Países no visibles en el mapa',
      detail: 'Los países con mayor densidad poblacional no son visibles en el mapa'
    });

    const top5 = this.filteredCountries
      .sort((a, b) => b.population / b.area - a.population / a.area)
      .slice(0, this.dataCount);

    top5.forEach(country => {
      this.chartLabels.push(country.translations['spa'].common);
      this.chartData.push((country.population / country.area).toString());
    });
    return top5;
  };

  borders = () => {
    const top5 = this.filteredCountries
      .sort((a, b) => {
        const aBorders = a.borders?.length || 0;
        const bBorders = b.borders?.length || 0;
        return bBorders - aBorders;
      })
      .slice(0, this.dataCount);

    top5.forEach(country => {
      this.chartLabels.push(country.translations['spa'].common);
      this.chartData.push(country.borders?.length.toString());
    });
    return top5;
  };

  languagues = () => {
    const top5 = this.filteredCountries
      .sort((a, b) => {
        const aLanguages = Object.keys(a.languages).length;
        const bLanguages = Object.keys(b.languages).length;
        return bLanguages - aLanguages;
      })
      .slice(0, this.dataCount);

    top5.forEach(country => {
      this.chartLabels.push(country.translations['spa'].common);
      this.chartData.push(Object.keys(country.languages).length.toString());
    });
    return top5;
  };

  region(selected: string) {
    this.resetData();

    Object.keys(Continents).forEach(continent => {
      if (continent === selected) {
        this.csTitle = Continents[continent];
      }
    });
    this.filteredCountries = JSON.parse(JSON.stringify(this.countries)) as Country[];

    this.filteredCountries = this.filteredCountries
      .filter(c => c.region === selected)
      .sort((a, b) => b.population - a.population);

    for (let i = 0; i < this.dataCount; i++) {
      this.chartLabels.push(this.filteredCountries[i].translations['spa'].common);
      this.chartData.push(this.filteredCountries[i].population.toString());
    }

    this.highlights = this.filteredCountries;
    this.setBarData();
  }

  resetData() {
    this.bgColor = [];
    this.chartLabels = [];
    this.chartData = [];
    this.highlights = [];
    this.setNewColors();
  }

  setNewColors() {
    for (let i = 0; i < this.dataCount; i++) {
      this.bgColor.push(this.rgbaRandomColor());
    }
  }

  rgbaRandomColor(): string {
    const number1 = Math.floor(Math.random() * 256);
    const number2 = Math.floor(Math.random() * 256);
    const number3 = Math.floor(Math.random() * 256);
    return `rgba(${number1}, ${number2}, ${number3}, 0.2)`;
  }

  goTo(country: Country) {
    this.router.navigate(['/countries', country.cca3]);
  }

  // Menú
  loadMenu() {
    this.items = [
      {
        label: 'Estadísticas',
        items: [
          {
            label: 'Países con mayor población',
            icon: 'pi pi-users',
            command: () => {
              this.csTitle = 'Países con mayor población';
              this.filterBy(this.population);
            }
          },
          {
            label: 'Países con mayor área',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'Países con mayor área';
              this.filterBy(this.area);
            }
          },
          {
            label: 'Países con mayor densidad poblacional',
            icon: 'pi pi-chart-bar',
            command: () => {
              this.csTitle = 'Países con mayor densidad poblacional';
              this.filterBy(this.density);
            }
          },
          {
            label: 'Países con más países fronterizos',
            icon: 'pi pi-compass',
            command: () => {
              this.csTitle = 'Países con más países fronterizos';
              this.filterBy(this.borders);
            }
          },
          {
            label: 'Países con más idiomas hablados',
            icon: 'pi pi-comments',
            command: () => {
              this.csTitle = 'Países con más idiomas hablados';
              this.filterBy(this.languagues);
            }
          }
        ]
      },
      {
        label: 'Continentes',
        items: [
          {
            label: 'África',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'África';
              this.region('africa');
            }
          },
          {
            label: 'América',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'América';
              this.region('americas');
            }
          },
          {
            label: 'Asia',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'Asia';
              this.region('asia');
            }
          },
          {
            label: 'Europa',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'Europa';
              this.region('europe');
            }
          },
          {
            label: 'Oceanía',
            icon: 'pi pi-globe',
            command: () => {
              this.csTitle = 'Oceanía';
              this.region('oceania');
            }
          }
        ]
      }
    ];
  }

  // Bar Chart
  setBarData() {
    if (isPlatformBrowser(this.platformId)) {
      const dataBorderColor: string[] = [];
      this.bgColor.forEach(color => {
        dataBorderColor.push(color.replace('0.2)', '1)'));
      });

      //Data
      this.basicData = {
        labels: this.chartLabels,
        datasets: [
          {
            label: '',
            data: this.chartData,
            backgroundColor: this.bgColor,
            borderColor: dataBorderColor,
            borderWidth: 1
          }
        ]
      };

      //Options
      this.setBarOptions();
      this.cd.markForCheck();
    }
  }

  setBarOptions() {
    this.basicOptions = this.chartConfigService.getBasicBarChartOptions();
  }

  @HostListener('window:resize', ['$event'])
  onResize = () => this.chartComponent()?.chart?.resize();
}
