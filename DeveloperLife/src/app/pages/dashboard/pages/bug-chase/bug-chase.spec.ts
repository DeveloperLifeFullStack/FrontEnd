import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugChase } from './bug-chase';

describe('BugChase', () => {
  let component: BugChase;
  let fixture: ComponentFixture<BugChase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BugChase]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BugChase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
