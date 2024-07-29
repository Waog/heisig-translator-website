import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { InputTextComponent } from './input-text.component';

describe('InputTextComponent', () => {
  let component: InputTextComponent;
  let fixture: ComponentFixture<InputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule, InputTextComponent],
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

    // Fill the input field beforehand
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

    await fixture.whenStable(); // Wait for promises to resolve

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

    await fixture.whenStable(); // Wait for promises to resolve

    expect(console.error).toHaveBeenCalledWith(
      'Failed to read clipboard contents: ',
      'Clipboard error'
    );
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
