import { TestBed } from '@angular/core/testing';

import { CodeCasinoServices } from './code-casino-services';

describe('CodeCasinoServices', () => {
  let service: CodeCasinoServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeCasinoServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
