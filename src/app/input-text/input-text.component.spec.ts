import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { InputTextComponent } from './input-text.component';
import { UrlParamService } from './url-param.service';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;
  let queryParamsSubject: Subject<any>;

  beforeEach(async () => {
    queryParamsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [FormsModule, InputTextComponent, RouterModule.forRoot([])],
      providers: [
        UrlParamService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit userInputChange on input change', () => {
    spyOn(component.userInputChange, 'emit');

    setInputValue('test');

    expect(component.userInputChange.emit).toHaveBeenCalledWith('test');
  });

  it('should reset input and emit empty string on reset button click', () => {
    spyOn(component.userInputChange, 'emit');

    component.userInput = 'initial value';
    fixture.detectChanges();

    clickButton('.reset-button');

    expect(component.userInput).toBe('');
    expect(component.userInputChange.emit).toHaveBeenCalledWith('');
  });

  it('should paste content from clipboard and emit it', async () => {
    spyOn(component.userInputChange, 'emit');
    spyOn(navigator.clipboard, 'readText').and.returnValue(
      Promise.resolve('clipboard content')
    );

    clickButton('.paste-button');

    await fixture.whenStable();

    expect(component.userInput).toBe('clipboard content');
    expect(component.userInputChange.emit).toHaveBeenCalledWith(
      'clipboard content'
    );
  });

  it('should handle clipboard read failure gracefully', async () => {
    spyOn(navigator.clipboard, 'readText').and.returnValue(
      Promise.reject('Clipboard error')
    );
    spyOn(console, 'error');

    clickButton('.paste-button');

    await fixture.whenStable();

    expect(console.error).toHaveBeenCalledWith(
      'Failed to read clipboard contents: ',
      'Clipboard error'
    );
  });

  it('should initialize input field with empty string if no URL parameter', (done: DoneFn) => {
    spyOn(component.userInputChange, 'emit');

    queryParamsSubject.next({});
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.userInput).toBe('');
      expect(component.userInputChange.emit).toHaveBeenCalledWith('');
      done();
    });
  });

  it('should initialize input field with simple input from URL parameter', (done: DoneFn) => {
    spyOn(component.userInputChange, 'emit');

    queryParamsSubject.next({ input: '你好' });
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.userInput).toBe('你好');
      expect(component.userInputChange.emit).toHaveBeenCalledWith('你好');
      done();
    });
  });

  it('should initialize input field with filtered input from Chrome mobile URL parameter', (done: DoneFn) => {
    spyOn(component.userInputChange, 'emit');

    queryParamsSubject.next({ input: '"你好" https://example.com' });
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(component.userInput).toBe('你好');
      expect(component.userInputChange.emit).toHaveBeenCalledWith('你好');
      done();
    });
  });

  function setInputValue(value: string) {
    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    inputElement.value = value;
    inputElement.dispatchEvent(new Event('input'));
  }

  function clickButton(selector: string) {
    const buttonElement = fixture.debugElement.query(
      By.css(selector)
    ).nativeElement;
    buttonElement.click();
  }
});
