import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Task, TaskPriority, TaskRecurrence } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">{{ task ? 'Edit Task' : 'Add Task' }}</h2>
            <button
              (click)="close.emit()"
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="input"
                [ngClass]="{'border-error-500 ring-1 ring-error-500': isFieldInvalid('title')}"
                placeholder="Task title"
              />
              <div *ngIf="isFieldInvalid('title')" class="error-text">
                Title is required
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (optional)
              </label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
                class="input"
                placeholder="Task description"
              ></textarea>
            </div>
            
            <!-- Due Date and Time -->
            <div class="mb-4">
              <label for="dueDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date & Time (optional)
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                formControlName="dueDate"
                class="input"
              />
            </div>
            
            <!-- Priority -->
            <div class="mb-4">
              <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                id="priority"
                formControlName="priority"
                class="input"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <!-- Recurrence -->
            <div class="mb-4">
              <label for="recurrence" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recurrence
              </label>
              <select
                id="recurrence"
                formControlName="recurrence"
                class="input"
              >
                <option [ngValue]="null">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            
            <!-- Tags -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (optional)
              </label>
              <div class="flex items-center space-x-2">
                <input
                  type="text"
                  [(ngModel)]="newTag"
                  [ngModelOptions]="{standalone: true}"
                  class="input"
                  placeholder="Add a tag"
                  (keyup.enter)="addTag()"
                />
                <button
                  type="button"
                  (click)="addTag()"
                  class="btn-secondary"
                >
                  Add
                </button>
              </div>
              
              <div *ngIf="tags.length > 0" class="mt-2 flex flex-wrap gap-2">
                <div *ngFor="let tag of tags; let i = index" 
                  class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ tag }}
                  <button
                    type="button"
                    (click)="removeTag(i)"
                    class="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                    aria-label="Remove tag"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                (click)="close.emit()"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="taskForm.invalid"
                class="btn-primary"
                [ngClass]="{'opacity-70 cursor-not-allowed': taskForm.invalid}"
              >
                {{ task ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()'
  }
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();
  
  taskForm!: FormGroup;
  newTag = '';
  tags: string[] = [];
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
    
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        priority: this.task.priority,
        recurrence: this.task.recurrence,
        dueDate: this.formatDateForInput(this.task.dueDate)
      });
      
      this.tags = this.task.tags ? [...this.task.tags] : [];
    }
  }
  
  initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      dueDate: [''],
      priority: ['Medium'],
      recurrence: [null]
    });
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
  
  addTag(): void {
    if (this.newTag.trim()) {
      if (!this.tags.includes(this.newTag.trim())) {
        this.tags.push(this.newTag.trim());
      }
      this.newTag = '';
    }
  }
  
  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }
  
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.taskForm.value;
    
    const taskData: Task = {
      id: this.task ? this.task.id : '',
      userId: this.task ? this.task.userId : '',
      title: formValue.title,
      description: formValue.description || undefined,
      dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
      priority: formValue.priority as TaskPriority,
      status: this.task ? this.task.status : 'Active',
      tags: this.tags.length > 0 ? this.tags : undefined,
      recurrence: formValue.recurrence as TaskRecurrence,
      createdAt: this.task ? this.task.createdAt : new Date()
    };
    
    this.save.emit(taskData);
  }
  
  formatDateForInput(date: Date | string | undefined): string {
    if (!date) return '';
    
    const dueDate = typeof date === 'string' ? new Date(date) : date;
    
    // Format: YYYY-MM-DDThh:mm
    return dueDate.toISOString().slice(0, 16);
  }
  
  onEscapeKey(): void {
    this.close.emit();
  }
}