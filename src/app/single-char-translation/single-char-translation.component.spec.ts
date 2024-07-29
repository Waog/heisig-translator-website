import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleCharTranslationComponent } from './single-char-translation.component';

describe('SingleCharTranslationComponent', () => {
  let component: SingleCharTranslationComponent;
  let fixture: ComponentFixture<SingleCharTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleCharTranslationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleCharTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
