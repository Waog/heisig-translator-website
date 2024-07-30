import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SingleCharacterComponent } from './single-character.component';

describe('SingleCharacterComponent', () => {
  let component: SingleCharacterComponent;
  let fixture: ComponentFixture<SingleCharacterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleCharacterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleCharacterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display pinyin, hanzi, and heisig', () => {
    component.hanzi = '好';
    component.ngOnChanges({
      hanzi: {
        currentValue: '好',
        previousValue: '',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();

    const pinyinElement = fixture.debugElement.query(
      By.css('.pinyin')
    ).nativeElement;
    const hanziElement = fixture.debugElement.query(
      By.css('.hanzi')
    ).nativeElement;
    const heisigElement = fixture.debugElement.query(
      By.css('.heisig')
    ).nativeElement;

    expect(pinyinElement.textContent).toBe('hǎo');
    expect(hanziElement.textContent).toBe('好');
    expect(heisigElement.textContent).toBe('good');
  });
});
