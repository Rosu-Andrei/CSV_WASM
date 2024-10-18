// src/app/components/csv-parser/csv-parser.component.ts

import { Component, AfterViewInit } from '@angular/core';
import { WasmService } from '../../services/wasm.service';
import { JsCsvParserService } from '../../services/js-csv-parser.service';

type ParsingMethod = 'Wasm' | 'JavaScript';

@Component({
  selector: 'app-csv-parser',
  templateUrl: './csv-parser.component.html',
  styleUrls: ['./csv-parser.component.css'],
})
export class CsvParserComponent implements AfterViewInit {
  csvData: string = '';
  parsedDataWasm: { age: number; fib_age: number }[] = [];
  parsedDataJs: { age: number; fib_age: number }[] = [];
  errorMessageWasm: string = '';
  errorMessageJs: string = '';
  loadingWasm: boolean = false;
  loadingJs: boolean = false;

  constructor(
    private wasmService: WasmService,
    private jsCsvParserService: JsCsvParserService
  ) {}

  ngAfterViewInit() {}

  /**
   * Handles file selection and reads the CSV file content.
   * @param event The file input change event.
   */
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.csvData = e.target?.result as string;
      };
      reader.readAsText(file);
    }
  }

  /**
   * Parses the CSV data using the selected method.
   * @param method The parsing method to use ('Wasm' or 'JavaScript').
   */
  async parseCsv(method: ParsingMethod) {
    if (!this.csvData) {
      this.displayError(method, 'Please upload a CSV file first.');
      return;
    }

    if (method === 'Wasm' && !this.wasmService.isLoaded) {
      this.displayError(
        method,
        'Wasm module is not loaded yet. Please try again shortly.'
      );
      return;
    }

    if (method === 'JavaScript') {
      this.loadingJs = true;
      this.errorMessageJs = '';
      this.parsedDataJs = [];
    } else {
      this.loadingWasm = true;
      this.errorMessageWasm = '';
      this.parsedDataWasm = [];
    }

    const startTime = performance.now();

    try {
      let result: { age: number; fib_age: number }[];
      if (method === 'Wasm') {
        result = this.wasmService.parseCsv(this.csvData);
      } else {
        result = await this.jsCsvParserService.parseCsv(this.csvData);
      }
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      if (method === 'Wasm') {
        this.parsedDataWasm = result;
        this.errorMessageWasm = `Parsed successfully in ${timeTaken} ms using Wasm.`;
      } else {
        this.parsedDataJs = result;
        this.errorMessageJs = `Parsed successfully in ${timeTaken} ms using JavaScript.`;
      }
    } catch (error: any) {
      this.displayError(method, `Error parsing CSV: ${error.message}`);
    } finally {
      if (method === 'Wasm') {
        this.loadingWasm = false;
      } else {
        this.loadingJs = false;
      }
    }
  }

  /**
   * Displays an error message for the specified parsing method.
   * @param method The parsing method ('Wasm' or 'JavaScript').
   * @param message The error message to display.
   */
  private displayError(method: ParsingMethod, message: string) {
    if (method === 'Wasm') {
      this.errorMessageWasm = message;
    } else {
      this.errorMessageJs = message;
    }
  }
}
