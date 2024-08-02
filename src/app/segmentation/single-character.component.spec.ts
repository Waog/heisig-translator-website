import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HeisigService } from '../shared/services/heisig.service';
import { SingleCharacterComponent } from './single-character.component';

describe('SingleCharacterComponent', () => {
  let component: SingleCharacterComponent;
  let fixture: ComponentFixture<SingleCharacterComponent>;
  let heisigServiceSpy: jasmine.SpyObj<HeisigService>;

  beforeEach(async () => {
    heisigServiceSpy = await configureTestingModule();
    ({ fixture, component } = createComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display pinyin, hanzi, and heisig', () => {
    setHeisigServiceSpyReturnValue('good');
    triggerHanziChange('好');

    expect(getElementText('.pinyin')).toBe('hǎo');
    expect(getElementText('.hanzi')).toBe('好');
    expect(getElementText('.heisig')).toBe('good');
  });

  async function configureTestingModule() {
    const spy = jasmine.createSpyObj('HeisigService', ['getHeisigEn']);

    await TestBed.configureTestingModule({
      imports: [SingleCharacterComponent],
      providers: [{ provide: HeisigService, useValue: spy }],
    }).compileComponents();

    return TestBed.inject(HeisigService) as jasmine.SpyObj<HeisigService>;
  }

  function createComponent() {
    const fixture = TestBed.createComponent(SingleCharacterComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  function setHeisigServiceSpyReturnValue(value: string) {
    heisigServiceSpy.getHeisigEn.and.returnValue(value);
  }

  function triggerHanziChange(hanzi: string) {
    component.hanzi = hanzi;
    component.ngOnChanges({
      hanzi: {
        currentValue: hanzi,
        previousValue: '',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
  }

  function getElementText(selector: string) {
    return fixture.debugElement.query(By.css(selector)).nativeElement
      .textContent;
  }
});
