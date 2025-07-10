import { Component, inject, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { TitleService } from '../../shared/services/title/title.service';

@Component({
  selector: 'app-countries',
  imports: [ButtonModule],
  templateUrl: './countries.component.html',
  styleUrl: './countries.component.scss'
})
export class CountriesComponent implements OnInit {
  private titleService = inject(TitleService);

  ngOnInit() {
    this.titleService.title = 'Listado de países';
  }
}
