import { TestBed } from '@angular/core/testing';

import { InteractiveWorldMapService } from './interactive-world-map.service';

describe('InteractiveWorldMapService', () => {
  let service: InteractiveWorldMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractiveWorldMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
