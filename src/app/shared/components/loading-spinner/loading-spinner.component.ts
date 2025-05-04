import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="loadingService.loading$ | async" 
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
        <div class="h-12 w-12 border-4 border-t-primary-500 border-primary-200 rounded-full animate-spin"></div>
        <p class="mt-2 text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  `
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}