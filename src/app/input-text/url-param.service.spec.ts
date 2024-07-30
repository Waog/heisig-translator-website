import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { UrlParamService } from './url-param.service';

describe('UrlParamService', () => {
  let service: UrlParamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UrlParamService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
    });
    service = TestBed.inject(UrlParamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty string if no input is provided', (done: DoneFn) => {
    TestBed.inject(ActivatedRoute).queryParams = of({});
    service.getFilteredInput().subscribe((input) => {
      expect(input).toBe('');
      done();
    });
  });

  it('should return simple input correctly', (done: DoneFn) => {
    TestBed.inject(ActivatedRoute).queryParams = of({ input: '你好' });
    service.getFilteredInput().subscribe((input) => {
      expect(input).toBe('你好');
      done();
    });
  });

  it('should return filtered input from Chrome mobile input', (done: DoneFn) => {
    TestBed.inject(ActivatedRoute).queryParams = of({
      input: '"你好" https://example.com',
    });
    service.getFilteredInput().subscribe((input) => {
      expect(input).toBe('你好');
      done();
    });
  });

  it('should clean input correctly', () => {
    const cleanedInput = service.cleanInput('"test-input" https://example.com');
    expect(cleanedInput).toBe('test-input');
  });

  it('should return trimmed input if pattern does not match', () => {
    const cleanedInput = service.cleanInput(' test-input ');
    expect(cleanedInput).toBe('test-input');
  });
});
