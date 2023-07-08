import { TestBed } from '@angular/core/testing';

import { DataEncryptService } from './data-encrypt.service';

describe('DataEncryptService', () => {
  let service: DataEncryptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataEncryptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
