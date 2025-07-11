import { Route } from '@angular/router';

import { CountriesPageComponent } from './countries-page/countries-page.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { MainComponent } from '../layouts/main/main.component';
import { ViewCountryComponent } from './view-country/view-country.component';

export const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'countries', component: CountriesPageComponent },
      { path: 'countries/:id', component: ViewCountryComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: '**', redirectTo: 'countries' }
    ]
  }
];
