import { Component, WritableSignal, Input, OnInit } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';

import { MenuItem } from 'primeng/api';

import { SocialMedia } from './interfaces/social-media.interface';

@Component({
  selector: 'app-nav',
  imports: [ButtonModule, DrawerModule, MenuModule, TooltipModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  socialMedia: SocialMedia[] = [
    { url: 'https://www.linkedin.com/in/jdanielbp/', icon: 'pi pi-linkedin', tooltip: 'LinkedIn' },
    { url: 'https://github.com/JDanielBP', icon: 'pi pi-github', tooltip: 'GitHub' }
  ];
  items: MenuItem[] | undefined;

  @Input() visible!: WritableSignal<boolean>;

  ngOnInit() {
    this.items = [
      {
        label: 'Principal',
        items: [
          {
            label: 'Listado de países',
            icon: 'pi pi-search',
            routerLink: 'countries',
            command: () => this.visible.set(false)
          }
        ]
      }
    ];
  }
}
