import { TestBed } from '@angular/core/testing';

import { JsCsvParserService } from './js-csv-parser.service';

describe('JsCsvParserService', () => {
  let service: JsCsvParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsCsvParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
