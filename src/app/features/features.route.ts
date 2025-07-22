import { Route } from '@angular/router';

import { ComparatorComponent } from './comparator/comparator.component';
import { CountriesPageComponent } from './countries-page/countries-page.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { MainComponent } from '../layouts/main/main.component';
import { ViewCountryComponent } from './view-country/view-country.component';
import { WorldMapDashboardComponent } from './world-map-dashboard/world-map-dashboard.component';

export const routes: Route[] = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: 'countries', component: CountriesPageComponent },
      { path: 'countries/:id', component: ViewCountryComponent },
      { path: 'favorites', component: FavoritesComponent },
      { path: 'comparator', component: ComparatorComponent },
      { path: 'world-map', component: WorldMapDashboardComponent },
      { path: '**', redirectTo: 'countries' }
    ]
  }
];
