import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoYouCode } from './who-you-code';

describe('WhoYouCode', () => {
  let component: WhoYouCode;
  let fixture: ComponentFixture<WhoYouCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhoYouCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhoYouCode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
