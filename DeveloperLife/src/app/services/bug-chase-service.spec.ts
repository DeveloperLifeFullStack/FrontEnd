import { TestBed } from '@angular/core/testing';

import { BugChaseService } from './bug-chase-service';

describe('BugChaseService', () => {
  let service: BugChaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BugChaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
