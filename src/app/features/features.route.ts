import { Route } from '@angular/router';
import { CountriesComponent } from './countries/countries.component';
import { MainComponent } from '../layouts/main/main.component';

export const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'countries', component: CountriesComponent },
      { path: '**', redirectTo: 'countries' }
    ]
  }
];
