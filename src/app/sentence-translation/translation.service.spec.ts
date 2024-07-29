import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TranslationService],
    });
    service = TestBed.inject(TranslationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should translate text from Chinese to English', () => {
    const mockResponse = {
      responseData: {
        translatedText: 'Hello',
      },
    };

    service.translate('你好', 'zh|en').subscribe((response) => {
      expect(response.responseData.translatedText).toBe('Hello');
    });

    const req = httpMock.expectOne(
      'https://api.mymemory.translated.net/get?q=%E4%BD%A0%E5%A5%BD&langpair=zh|en'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should translate text from Chinese to German', () => {
    const mockResponse = {
      responseData: {
        translatedText: 'Hallo',
      },
    };

    service.translate('你好', 'zh|de').subscribe((response) => {
      expect(response.responseData.translatedText).toBe('Hallo');
    });

    const req = httpMock.expectOne(
      'https://api.mymemory.translated.net/get?q=%E4%BD%A0%E5%A5%BD&langpair=zh|de'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle translation error gracefully', () => {
    const mockErrorResponse = {
      responseData: {
        translatedText: '',
      },
    };

    service.translate('错误', 'zh|en').subscribe(
      (response) => {
        expect(response.responseData.translatedText).toBe('');
      },
      (error) => {
        fail('Expected no error, but got one.');
      }
    );

    const req = httpMock.expectOne(
      'https://api.mymemory.translated.net/get?q=%E9%94%99%E8%AF%AF&langpair=zh|en'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockErrorResponse);
  });

  it('should handle HTTP error response gracefully', () => {
    const errorMessage = 'simulated network error';

    service.translate('错误', 'zh|en').subscribe(
      (response) => {
        fail('Expected an error, but got a response.');
      },
      (error) => {
        expect(error).toBeTruthy();
      }
    );

    const req = httpMock.expectOne(
      'https://api.mymemory.translated.net/get?q=%E9%94%99%E8%AF%AF&langpair=zh|en'
    );
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('Network error', { message: errorMessage }));
  });
});
