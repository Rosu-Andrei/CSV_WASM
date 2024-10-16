// src/app/components/csv-parser/csv-parser.component.ts
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { WasmService } from '../../services/wasm.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-csv-parser',
  templateUrl: './csv-parser.component.html',
  styleUrls: ['./csv-parser.component.css'],
})
export class CsvParserComponent implements AfterViewInit {
  csvData: string = '';
  parsedData: any[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>(this.parsedData);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private wasmService: WasmService) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

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

  parseCsv() {
    if (!this.csvData) {
      this.errorMessage = 'Please upload a CSV file first.';
      return;
    }

    if (!this.wasmService.isLoaded) {
      this.errorMessage = 'Wasm module is not loaded yet. Please try again shortly.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.parsedData = [];
    this.displayedColumns = [];

    try {
      const result = this.wasmService.parseCsv(this.csvData);
      if (typeof result === 'string') {
        // Handle error message from Rust
        this.errorMessage = result as string;
      } else {
        this.parsedData = result;
        this.dataSource.data = this.parsedData;
        if (this.parsedData.length > 0) {
          this.displayedColumns = Object.keys(this.parsedData[0]);
        }
      }
    } catch (error: any) {
      this.errorMessage = 'Error parsing CSV: ' + error.message;
    } finally {
      this.loading = false;
    }
  }
}
