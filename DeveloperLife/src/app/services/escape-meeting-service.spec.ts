import { TestBed } from '@angular/core/testing';

import { EscapeMeetingService } from './escape-meeting-service';

describe('EscapeMeetingService', () => {
  let service: EscapeMeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscapeMeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
