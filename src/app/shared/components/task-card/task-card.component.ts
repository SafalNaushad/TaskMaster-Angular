import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../core/models/task.model';
import { format } from 'date-fns';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-3 transition-all hover:shadow-md">
      <div class="flex items-start">
        <div class="mr-3 mt-1">
          <input
            type="checkbox"
            [checked]="task.status === 'Completed'"
            (change)="toggleStatus()"
            class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            [attr.aria-label]="'Mark ' + task.title + ' as ' + (task.status === 'Completed' ? 'active' : 'completed')"
          />
        </div>
        
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-medium mb-1"
              [class.line-through]="task.status === 'Completed'"
              [class.text-gray-500]="task.status === 'Completed'"
            >
              {{ task.title }}
            </h3>
            
            <div class="flex space-x-2">
              <button
                (click)="onEdit.emit(task)"
                class="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                aria-label="Edit task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              
              <button
                (click)="onDelete.emit(task.id)"
                class="text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                aria-label="Delete task"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <p *ngIf="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {{ task.description }}
          </p>
          
          <div class="flex flex-wrap items-center mt-2 gap-2">
            <div *ngIf="task.dueDate" class="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDueDate(task.dueDate) }}
            </div>
            
            <div 
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
              [ngClass]="getPriorityClass()"
            >
              {{ task.priority }}
            </div>
            
            <div *ngIf="task.recurrence" class="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ task.recurrence }}
            </div>
            
            <div *ngFor="let tag of task.tags" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {{ tag }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() onToggleStatus = new EventEmitter<Task>();
  @Output() onEdit = new EventEmitter<Task>();
  @Output() onDelete = new EventEmitter<string>();
  
  toggleStatus(): void {
    const updatedTask = {
      ...this.task,
      status: this.task.status === 'Active' ? 'Completed' as const : 'Active' as const
    };
    this.onToggleStatus.emit(updatedTask);
  }
  
  formatDueDate(date: Date | string): string {
    const dueDate = typeof date === 'string' ? new Date(date) : date;
    return format(dueDate, 'MMM d, yyyy h:mm a');
  }
  
  getPriorityClass(): string {
    switch (this.task.priority) {
      case 'High':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300';
      case 'Medium':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300';
      case 'Low':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }
}