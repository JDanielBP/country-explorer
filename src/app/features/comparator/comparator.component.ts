import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

import { SaveButtonComponent } from '../../shared/components/save-button/save-button.component';

import { CountryService } from '../../shared/services/country/country.service';
import { TitleService } from '../../shared/services/title/title.service';

import { Country } from '../../core/models/countries.interface';

@Component({
  selector: 'app-comparator',
  imports: [
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SaveButtonComponent,
    SelectModule,
    TooltipModule
  ],
  providers: [],
  templateUrl: './comparator.component.html',
  styleUrl: './comparator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComparatorComponent implements OnInit {
  loading = true;
  lowerLimit = 2;
  upperLimit = 8;
  waitTime = 0;
  gridColumns = this.lowerLimit;

  readonly greenBg = 'var(--p-button-outlined-success-active-background)';
  readonly redBg = 'var(--p-button-outlined-danger-active-background)';
  readonly yellowBg = 'var(--p-button-outlined-warn-active-background)';

  countriesShortInfo: Country[] = [];
  cca3s: string[] = [];
  countriesToCompare: Country[] = [];

  myForm!: FormGroup;

  private countryService = inject(CountryService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private titleService = inject(TitleService);

  ngOnInit() {
    this.myForm = this.fb.group({
      selectedCountries: this.fb.array([this.newCountry(), this.newCountry()])
    });

    this.titleService.title = 'Comparador de países';

    this.countryService.getAllShortInfo().subscribe(countries => {
      this.countriesShortInfo = countries.map(country => ({
        ...country,
        spanishName: country.translations['spa'].common
      }));
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  // Form
  get countriesForm() {
    return this.myForm.get('selectedCountries') as FormArray;
  }

  addCountry() {
    this.countriesForm.push(this.newCountry());
    this.cca3s.push('');
    this.gridColumns++;
  }

  newCountry() {
    return this.fb.control('');
  }

  addOption() {
    if (this.countriesForm.length < this.upperLimit) this.addCountry();
  }

  removeOption(index: number) {
    if (this.countriesForm.length > this.lowerLimit) {
      this.countriesForm.removeAt(index);
      this.countriesToCompare.splice(index, 1);
      this.cca3s.splice(index, 1);
      this.gridColumns--;
    }
  }

  // Styles
  gridTemplateColumns() {
    return `repeat(${this.gridColumns}, 1fr)`;
  }

  // Disable buttons
  upper() {
    const used = Object.values(this.countriesForm.value).filter(x => x !== '');
    return used.length < this.countriesForm.value.length || this.countriesForm.value.length >= 8;
  }

  lower() {
    return this.countriesForm.length <= this.lowerLimit;
  }

  minInfo() {
    const used = Object.values(this.countriesForm.value).filter(x => x !== '');
    return used.length < this.lowerLimit;
  }

  // <p-select>
  check(index: number, event: { value: string }) {
    const exist = this.cca3s.findIndex(cca3 => cca3 === event?.value);
    if (exist !== -1) {
      this.countriesForm.at(index)?.setValue(this.cca3s[index] ?? '');
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: 'Ya has seleccionado este país'
      });
    } else this.cca3s[index] = event?.value;
  }

  // Execution
  compare() {
    if (this.waitTime === 0) {
      const cca3s = this.cca3s.filter(x => x !== '');
      forkJoin(cca3s.map(cca3 => this.countryService.getCountryByCode(cca3))).subscribe(countries => {
        this.countriesToCompare = countries;
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Datos actualizados'
        });
        this.cdr.markForCheck();
        this.wait();
      });
    } else {
      this.messageService.clear();
      this.messageService.add({
        severity: 'error',
        summary: `Espere ${this.waitTime} segundos antes de realizar la próxima comparación`
      });
    }
  }

  population(country: Country) {
    // Su valor es 0
    if (country.population === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (this.countriesToCompare.every(c => c.population === this.countriesToCompare[0].population))
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    if ([...this.countriesToCompare].sort((a, b) => b.population - a.population)[0].cca3 === country.cca3)
      return { 'background-color': this.greenBg };
    return;
  }

  area(country: Country) {
    // Su valor es 0
    if (country.area === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (this.countriesToCompare.every(c => c.area === this.countriesToCompare[0].area))
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    if ([...this.countriesToCompare].sort((a, b) => b.area - a.area)[0].cca3 === country.cca3)
      return { 'background-color': this.greenBg };
    return;
  }

  borders(country: Country) {
    // Su valor es 0
    if ((country.borders || []).length === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (
      this.countriesToCompare.every(c => (c.borders || []).length === (this.countriesToCompare[0].borders || []).length)
    )
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    return {
      'background-color':
        [...this.countriesToCompare].sort((a, b) => (b.borders || []).length - (a.borders || []).length)[0].cca3 ===
        country.cca3
          ? this.greenBg
          : ''
    };
  }

  timezones(country: Country) {
    // Su valor es 0
    if (country.timezones.length === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (this.countriesToCompare.every(c => c.timezones.length === this.countriesToCompare[0].timezones.length))
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    return {
      'background-color':
        [...this.countriesToCompare].sort((a, b) => b.timezones.length - a.timezones.length)[0].cca3 === country.cca3
          ? this.greenBg
          : ''
    };
  }

  languages(country: Country) {
    // Su valor es 0
    if (this.languagesCount(country) === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (this.countriesToCompare.every(c => this.languagesCount(c) === this.languagesCount(this.countriesToCompare[0])))
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    return {
      'background-color':
        [...this.countriesToCompare].sort((a, b) => this.languagesCount(b) - this.languagesCount(a))[0].cca3 ===
        country.cca3
          ? this.greenBg
          : ''
    };
  }

  currencies(country: Country) {
    // Su valor es 0
    if (this.currenciesCount(country) === 0) return { 'background-color': this.redBg };
    // Son todos iguales
    if (
      this.countriesToCompare.every(c => this.currenciesCount(c) === this.currenciesCount(this.countriesToCompare[0]))
    )
      return { 'background-color': this.yellowBg };
    // Es el valor más alto
    return {
      'background-color':
        [...this.countriesToCompare].sort((a, b) => this.currenciesCount(b) - this.currenciesCount(a))[0].cca3 ===
        country.cca3
          ? this.greenBg
          : ''
    };
  }

  // Tools
  currenciesCount(country: Country) {
    return Object.keys(country.currencies || []).length;
  }

  languagesCount(country: Country) {
    return Object.keys(country.languages || []).length;
  }

  wait() {
    this.waitTime = 5;
    const wait = setInterval(() => {
      if (this.waitTime > 0) {
        this.waitTime--;
      } else {
        this.waitTime = 0;
        clearTimeout(wait);
      }
    }, 1000);
  }
}
