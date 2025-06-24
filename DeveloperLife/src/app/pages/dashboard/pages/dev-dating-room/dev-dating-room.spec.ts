import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevDatingRoom } from './dev-dating-room';

describe('DevDatingRoom', () => {
  let component: DevDatingRoom;
  let fixture: ComponentFixture<DevDatingRoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevDatingRoom]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevDatingRoom);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
