import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeCasino } from './code-casino';

describe('CodeCasino', () => {
  let component: CodeCasino;
  let fixture: ComponentFixture<CodeCasino>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeCasino]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodeCasino);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
