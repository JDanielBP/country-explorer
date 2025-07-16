import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { NavComponent } from '../nav/nav.component';

import { ThemesService } from '../../shared/services/themes/themes.service';
import { TitleService } from '../../shared/services/title/title.service';

@Component({
  selector: 'app-header',
  imports: [ButtonModule, NavComponent, TooltipModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  theme = signal('');
  title = signal('');
  visible = signal(false);

  private themesService = inject(ThemesService);
  private titleService = inject(TitleService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.titleService.title$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(title => {
      this.title.set(title);
    });

    this.themesService.theme$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(theme => {
      this.theme.set(theme);
    });
  }

  toggleDarkMode() {
    this.themesService.toggleTheme();
    this.theme.set(this.themesService._theme);
  }
}
