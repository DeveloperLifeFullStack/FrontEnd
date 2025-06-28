import { TestBed } from '@angular/core/testing';

import { CodeRoastService } from './code-roast-service';

describe('CodeRoastService', () => {
  let service: CodeRoastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CodeRoastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
