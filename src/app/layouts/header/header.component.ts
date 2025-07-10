import { Component, inject, signal, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { NavComponent } from '../nav/nav.component';

import { TitleService } from '../../shared/services/title/title.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, NavComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  private titleService = inject(TitleService);
  title = signal('');

  visible = signal(false);

  ngOnInit() {
    this.titleService.title$.subscribe(title => {
      this.title.set(title);
    });
  }
}
