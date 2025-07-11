import { Component, inject, signal, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { NavComponent } from '../nav/nav.component';

import { TitleService } from '../../shared/services/title/title.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, NavComponent, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  theme = signal('light-mode');
  title = signal('');
  visible = signal(false);

  private titleService = inject(TitleService);

  ngOnInit() {
    this.titleService.title$.subscribe(title => {
      this.title.set(title);
    });

    const theme = localStorage.getItem('theme');
    if (theme) this.theme.set(theme);

    if (this.theme()) document.querySelector('html')?.classList.add(this.theme());
    else document.querySelector('html')?.classList.add(this.theme());
    localStorage.setItem('theme', this.theme());
  }

  toggleDarkMode() {
    const element = document.querySelector('html')!;
    this.theme.set(this.theme() === 'light-mode' ? 'dark-mode' : 'light-mode');
    element.classList.toggle('dark-mode');
    element.classList.toggle('light-mode');
    localStorage.setItem('theme', this.theme());
  }
}
