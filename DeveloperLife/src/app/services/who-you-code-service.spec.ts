import { TestBed } from '@angular/core/testing';

import { WhoYouCodeService } from './who-you-code-service';

describe('WhoYouCodeService', () => {
  let service: WhoYouCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhoYouCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
