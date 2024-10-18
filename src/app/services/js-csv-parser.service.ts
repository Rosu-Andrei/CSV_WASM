import {Injectable} from '@angular/core';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root',
})
export class JsCsvParserService {
  constructor() {
  }

  // Fibonacci function
  fibSequence(n: number): number {
    if (n <= 1) return n;
    let prev = 0;
    let curr = 1;
    for (let i = 2; i <= n; i++) {
      const next = prev + curr;
      prev = curr;
      curr = next;
    }
    return curr;
  }

  // Parses CSV data and computes Fibonacci for age
  parseCsv(data: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(data, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (result) => {
          console.log('Parsed CSV data:', result.data);
          const processedData = result.data.map((record: any) => {
            console.log('Record:', record);
            // Access 'Age' with uppercase 'A'
            const ageStr = record['age'];
            const ageInt = parseInt(ageStr, 10);
            if (isNaN(ageInt)) {
              // Handle invalid age value
              return {age: null, fib_age: null};
            } else {
              // Compute Fibonacci number for age
              const fibAge = this.fibSequence(ageInt);
              return {age: ageInt, fib_age: fibAge};
            }
          });
          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }
}
