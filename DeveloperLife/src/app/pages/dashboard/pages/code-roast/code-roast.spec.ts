import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeRoast } from './code-roast';

describe('CodeRoast', () => {
  let component: CodeRoast;
  let fixture: ComponentFixture<CodeRoast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeRoast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeRoast);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
