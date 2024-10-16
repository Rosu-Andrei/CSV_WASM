// src/app/services/wasm.service.ts
import { Injectable } from '@angular/core';
import init, { parse_csv } from '../../assets/pkg/large_data_handler.js'; // Adjust the path as necessary

@Injectable({
  providedIn: 'root',
})
export class WasmService {
  public isLoaded: boolean = false;

  constructor() {
    this.loadWasm();
  }

  async loadWasm() {
    try {
      // Initialize the Wasm module by calling init() with the correct path to the .wasm file
      await init('/assets/pkg/large_data_handler_bg.wasm');
      this.isLoaded = true;
      console.log('Wasm module loaded and initialized successfully');
    } catch (error) {
      console.error('Error loading Wasm module:', error);
    }
  }

  // Method to parse CSV data
  parseCsv(data: string): any {
    if (this.isLoaded) {
      try {
        const result = parse_csv(data);
        return result;
      } catch (e) {
        throw new Error(`Wasm parse_csv error: ${e}`);
      }
    } else {
      throw new Error('Wasm module not loaded');
    }
  }
}
