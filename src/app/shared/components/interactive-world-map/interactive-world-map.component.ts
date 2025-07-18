import {
  Component,
  ElementRef,
  input,
  viewChild,
  effect,
  output,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';

import { TooltipModule } from 'primeng/tooltip';
import panzoom, { PanZoom } from 'panzoom';

import { Country } from '../../../core/models/countries.interface';

import { InteractiveWorldMapService } from './interactive-world-map.service';
import { ThemesService } from '../../services/themes/themes.service';

@Component({
  selector: 'app-interactive-world-map',
  imports: [ButtonModule, TooltipModule],
  templateUrl: './interactive-world-map.component.html',
  styleUrl: './interactive-world-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InteractiveWorldMapComponent {
  scale = 1;
  theme = '';

  countries = input<Country[]>([]);
  highlights = input<Country[]>([]);
  /**
   * Altura máxima del mapa.
   *
   * @default 'calc(100vh - 1rem)'
   */
  maxHeight = input<string>('calc(100vh - 1rem)');

  selectedCountry = output<Country>();

  mapSvg = viewChild<ElementRef<SVGSVGElement>>('mapSvg');

  private panzoomInstance!: PanZoom;

  private destroyRef = inject(DestroyRef);
  private themesService = inject(ThemesService);
  private svg = inject(InteractiveWorldMapService);

  constructor() {
    this.setSvgImage();
    effect(() => {
      if (this.countries().length > 0) {
        this.highlights(); // Colocada para que Angular detecte sus cambios
        if (!this.mapSvg()?.nativeElement.innerHTML) return;
        this.initMap();
        this.setColor();
      }
    });

    this.themesService.theme$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(theme => {
      this.theme = theme;
      if (!this.mapSvg()?.nativeElement.innerHTML) return;
      this.setColor();
    });
  }

  setSvgImage() {
    this.svg.getSvgWorldMap().subscribe(svg => {
      const svgWithStyle = svg.slice(0, 7) + `style="max-height: ${this.maxHeight()};" ` + svg.slice(7);
      this.mapSvg()!.nativeElement.innerHTML = svgWithStyle;
      this.initMap();
      this.setColor();
    });
  }

  initMap() {
    const svgNative = this.mapSvg()!.nativeElement;
    const paths = svgNative.querySelectorAll('path');

    if (svgNative) {
      this.panzoomInstance = panzoom(svgNative, {
        zoomDoubleClickSpeed: 1,
        minZoom: 1,
        maxZoom: 12,
        bounds: true
      });
    }

    paths.forEach(path => {
      path.id = path.id.toUpperCase();
      const country = this.countries().find(country => country.cca2 === path.id.toUpperCase())!;

      // Funcionalidad
      path.addEventListener('click', () => {
        this.selectedCountry.emit(country);
      });

      // Agrega <title>
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = country?.translations['spa'].common ?? '';
      path.appendChild(title);
    });
  }

  zoomIn() {
    this.panzoomInstance.zoomTo(0, 0, 1.2);
  }

  zoomOut() {
    this.panzoomInstance.zoomTo(0, 0, 0.8);
  }

  resetMapPosition() {
    this.panzoomInstance.moveTo(0, 0);
    this.panzoomInstance.zoomAbs(0, 0, 1);
  }

  setColor() {
    const svgNative = this.mapSvg()!.nativeElement;
    const paths = svgNative.querySelectorAll('path');

    paths.forEach(path => {
      path.style.stroke = 'var(--bg-color)';
      path.style.strokeWidth = '0.1px';

      this.setFillColor(path);
      path.addEventListener('mouseover', () => {
        path.style.fill = '#60A5FA';
        path.style.cursor = 'pointer';
      });
      path.addEventListener('mouseleave', () => {
        this.setFillColor(path);
      });
    });
  }

  setFillColor(path: SVGPathElement) {
    const highlight = this.highlights().find(country => country.cca2 === path.id.toUpperCase());

    if (!highlight) {
      path.style.fill = 'var(--toolbar-background-color)';
      return;
    }

    path.style.fill = 'var(--p-button-success-background)';
  }
}
