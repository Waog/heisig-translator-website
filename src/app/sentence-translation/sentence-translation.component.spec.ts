import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceTranslationComponent } from './sentence-translation.component';

describe('SentenceTranslationComponent', () => {
  let component: SentenceTranslationComponent;
  let fixture: ComponentFixture<SentenceTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentenceTranslationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentenceTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
