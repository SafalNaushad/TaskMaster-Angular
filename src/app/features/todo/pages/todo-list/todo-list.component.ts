import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TaskCardComponent } from '../../../../shared/components/task-card/task-card.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';
import { TaskService } from '../../../../core/services/task.service';
import { Task, TaskPriority } from '../../../../core/models/task.model';
import { format, isToday, parseISO, startOfDay, endOfDay } from 'date-fns';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HeaderComponent,
    LoadingSpinnerComponent,
    TaskCardComponent,
    TaskFormComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <app-loading-spinner></app-loading-spinner>
      <app-header></app-header>
      
      <main class="flex-1 container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 class="text-2xl font-bold">{{ pageTitle }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1">{{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}</p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <button
              (click)="openTaskModal()"
              class="btn-primary flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
        
        <!-- Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <!-- Search -->
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilters()"
                  placeholder="Search tasks..."
                  class="input pl-10"
                />
              </div>
            </div>
            
            <!-- Priority Filter -->
            <div class="w-full md:w-auto">
              <select
                [(ngModel)]="priorityFilter"
                (ngModelChange)="applyFilters()"
                class="input"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <!-- Status Filter -->
            <div class="w-full md:w-auto">
              <select
                [(ngModel)]="statusFilter"
                (ngModelChange)="applyFilters()"
                class="input"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <!-- Clear Filters -->
            <div>
              <button
                (click)="clearFilters()"
                class="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          <!-- Tag Filter -->
          <div class="mt-4 flex flex-wrap gap-2">
            <div *ngFor="let tag of availableTags" 
              class="inline-flex items-center px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
              [class.bg-primary-100]="selectedTags.includes(tag)"
              [class.text-primary-800]="selectedTags.includes(tag)"
              [class.dark:bg-primary-900]="selectedTags.includes(tag)"
              [class.dark:text-primary-300]="selectedTags.includes(tag)"
              [class.bg-gray-100]="!selectedTags.includes(tag)"
              [class.text-gray-800]="!selectedTags.includes(tag)"
              [class.dark:bg-gray-700]="!selectedTags.includes(tag)"
              [class.dark:text-gray-300]="!selectedTags.includes(tag)"
              (click)="toggleTagFilter(tag)"
            >
              {{ tag }}
            </div>
          </div>
        </div>
        
        <!-- Task List -->
        <div *ngIf="filteredTasks.length > 0" class="space-y-2">
          <app-task-card
            *ngFor="let task of filteredTasks"
            [task]="task"
            (onToggleStatus)="updateTaskStatus($event)"
            (onEdit)="editTask($event)"
            (onDelete)="deleteTask($event)"
          ></app-task-card>
        </div>
        
        <!-- Empty State -->
        <div *ngIf="filteredTasks.length === 0" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
          <p class="mt-1 text-gray-500 dark:text-gray-400">
            {{ getEmptyStateMessage() }}
          </p>
          <div class="mt-6">
            <button
              (click)="openTaskModal()"
              class="btn-primary"
            >
              Add a new task
            </button>
          </div>
        </div>
        
        <!-- Task Modal -->
        <app-task-form
          *ngIf="showTaskModal"
          [task]="selectedTask"
          (close)="closeTaskModal()"
          (save)="saveTask($event)"
        ></app-task-form>
      </main>
    </div>
  `
})
export class TodoListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  availableTags: string[] = [];
  
  // Filter states
  searchQuery = '';
  priorityFilter = '';
  statusFilter = '';
  selectedTags: string[] = [];
  
  // Modal state
  showTaskModal = false;
  selectedTask: Task | null = null;
  
  // Route params
  pageFilter = '';
  
  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}
  
  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.pageFilter = data['filter'] || '';
      this.loadTasks();
    });
  }
  
  get pageTitle(): string {
    switch (this.pageFilter) {
      case 'upcoming':
        return 'Upcoming Tasks';
      case 'today':
        return 'Today\'s Tasks';
      case 'completed':
        return 'Completed Tasks';
      default:
        return 'All Tasks';
    }
  }
  
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.extractAvailableTags();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading tasks', error);
      }
    });
  }
  
  extractAvailableTags(): void {
    const tagsSet = new Set<string>();
    
    this.tasks.forEach(task => {
      if (task.tags && task.tags.length > 0) {
        task.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    this.availableTags = Array.from(tagsSet);
  }
  
  applyFilters(): void {
    let filtered = [...this.tasks];
    
    // Apply route-based filter
    if (this.pageFilter) {
      filtered = this.applyRouteFilter(filtered);
    }
    
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) || 
        (task.description && task.description.toLowerCase().includes(query))
      );
    }
    
    // Apply priority filter
    if (this.priorityFilter) {
      filtered = filtered.filter(task => task.priority === this.priorityFilter);
    }
    
    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(task => task.status === this.statusFilter);
    }
    
    // Apply tag filters
    if (this.selectedTags.length > 0) {
      filtered = filtered.filter(task => 
        task.tags && this.selectedTags.some(tag => task.tags!.includes(tag))
      );
    }
    
    this.filteredTasks = filtered;
  }
  
  applyRouteFilter(tasks: Task[]): Task[] {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    switch (this.pageFilter) {
      case 'upcoming':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
          return dueDate > endOfToday;
        });
        
      case 'today':
        return tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
          return dueDate >= startOfToday && dueDate <= endOfToday;
        });
        
      case 'completed':
        return tasks.filter(task => task.status === 'Completed');
        
      default:
        return tasks;
    }
  }
  
  clearFilters(): void {
    this.searchQuery = '';
    this.priorityFilter = '';
    this.statusFilter = '';
    this.selectedTags = [];
    this.applyFilters();
  }
  
  toggleTagFilter(tag: string): void {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyFilters();
  }
  
  updateTaskStatus(task: Task): void {
    this.taskService.updateTask(task.id, {
      status: task.status
    }).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === updatedTask.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating task status', error);
      }
    });
  }
  
  openTaskModal(): void {
    this.selectedTask = null;
    this.showTaskModal = true;
  }
  
  editTask(task: Task): void {
    this.selectedTask = { ...task };
    this.showTaskModal = true;
  }
  
  closeTaskModal(): void {
    this.showTaskModal = false;
    this.selectedTask = null;
  }
  
  saveTask(task: Task): void {
    if (this.selectedTask) {
      // Update existing task
      this.taskService.updateTask(this.selectedTask.id, task).subscribe({
        next: (updatedTask) => {
          const index = this.tasks.findIndex(t => t.id === updatedTask.id);
          if (index !== -1) {
            this.tasks[index] = updatedTask;
            this.extractAvailableTags();
            this.applyFilters();
          }
          this.closeTaskModal();
        },
        error: (error) => {
          console.error('Error updating task', error);
        }
      });
    } else {
      // Create new task
      this.taskService.createTask(task).subscribe({
        next: (newTask) => {
          this.tasks.push(newTask);
          this.extractAvailableTags();
          this.applyFilters();
          this.closeTaskModal();
        },
        error: (error) => {
          console.error('Error creating task', error);
        }
      });
    }
  }
  
  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.extractAvailableTags();
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error deleting task', error);
        }
      });
    }
  }
  
  getEmptyStateMessage(): string {
    if (this.searchQuery || this.priorityFilter || this.statusFilter || this.selectedTags.length > 0) {
      return 'Try clearing some filters to see more tasks.';
    }
    
    switch (this.pageFilter) {
      case 'upcoming':
        return 'You don\'t have any upcoming tasks.';
      case 'today':
        return 'You don\'t have any tasks due today.';
      case 'completed':
        return 'You haven\'t completed any tasks yet.';
      default:
        return 'Click the button below to add your first task.';
    }
  }
}