import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscapeMeeting } from './escape-meeting';

describe('EscapeMeeting', () => {
  let component: EscapeMeeting;
  let fixture: ComponentFixture<EscapeMeeting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscapeMeeting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscapeMeeting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
