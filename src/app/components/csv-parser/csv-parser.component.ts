import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {WasmService} from '../../services/wasm.service';
import {JsCsvParserService} from '../../services/js-csv-parser.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';

type ParsingMethod = 'Wasm' | 'JavaScript';

@Component({
  selector: 'app-csv-parser',
  templateUrl: './csv-parser.component.html',
  styleUrls: ['./csv-parser.component.css'],
})
export class CsvParserComponent implements AfterViewInit {
  csvData: string = '';
  parsedDataWasm: any[] = [];
  parsedDataJs: any[] = [];
  errorMessageWasm: string = '';
  errorMessageJs: string = '';
  loadingWasm: boolean = false;
  loadingJs: boolean = false;

  displayedColumnsWasm: string[] = [];
  displayedColumnsJs: string[] = [];

  dataSourceWasm = new MatTableDataSource<any>(this.parsedDataWasm);
  dataSourceJs = new MatTableDataSource<any>(this.parsedDataJs);

  @ViewChild('paginatorWasm') paginatorWasm!: MatPaginator;
  @ViewChild('paginatorJs') paginatorJs!: MatPaginator;

  constructor(
    private wasmService: WasmService,
    private jsCsvParserService: JsCsvParserService
  ) {
  }

  ngAfterViewInit() {
    this.dataSourceWasm.paginator = this.paginatorWasm;
    this.dataSourceJs.paginator = this.paginatorJs;
  }

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
      this.displayError(method, 'Wasm module is not loaded yet. Please try again shortly.');
      return;
    }

    if (method === 'JavaScript') {
      this.loadingJs = true;
      this.errorMessageJs = '';
      this.parsedDataJs = [];
      this.displayedColumnsJs = [];
    } else {
      this.loadingWasm = true;
      this.errorMessageWasm = '';
      this.parsedDataWasm = [];
      this.displayedColumnsWasm = [];
    }

    const startTime = performance.now();

    try {
      let result: any[];
      if (method === 'Wasm') {
        result = this.wasmService.parseCsv(this.csvData);
      } else {
        result = await this.jsCsvParserService.parseCsv(this.csvData);
      }
      const endTime = performance.now();
      const timeTaken = (endTime - startTime).toFixed(2);

      if (method === 'Wasm') {
        this.parsedDataWasm = result;
        this.dataSourceWasm.data = this.parsedDataWasm;
        if (this.parsedDataWasm.length > 0) {
          this.displayedColumnsWasm = Object.keys(this.parsedDataWasm[0]);
        }
        this.errorMessageWasm = `Parsed successfully in ${timeTaken} ms using Wasm.`;
      } else {
        this.parsedDataJs = result;
        this.dataSourceJs.data = this.parsedDataJs;
        if (this.parsedDataJs.length > 0) {
          this.displayedColumnsJs = Object.keys(this.parsedDataJs[0]);
        }
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
