// src/app/services/js-csv-parser.service.ts
import {Injectable} from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class JsCsvParserService {
  constructor() {
  }

  /**
   * Parses CSV data using PapaParse.
   * @param data The CSV data as a string.
   * @returns A promise that resolves with the parsed data or rejects with an error.
   */
  parseCsv(data: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve(result.data);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
}
