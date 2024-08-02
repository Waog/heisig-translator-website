import { TestBed } from '@angular/core/testing';

import { HeisigService } from './heisig.service';

describe('HeisigService', () => {
  let service: HeisigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeisigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('returns the correct english for a given Hanzi ', () => {
    expect(service.getHeisigEn('好')).toBe('good');
  });

  it('returns undefined for non-existing entries', () => {
    expect(service.getHeisigEn('X')).toBeUndefined();
  });
});
