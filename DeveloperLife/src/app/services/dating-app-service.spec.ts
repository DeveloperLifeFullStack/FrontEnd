import { TestBed } from '@angular/core/testing';

import { DatingAppService } from './dating-app-service';

describe('DatingAppService', () => {
  let service: DatingAppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatingAppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
