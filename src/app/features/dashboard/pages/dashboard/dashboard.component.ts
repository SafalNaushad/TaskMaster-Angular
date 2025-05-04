import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task.model';
import { format, startOfDay, endOfDay, parseISO } from 'date-fns';
import { DashboardChartComponent } from '../../components/dashboard-chart/dashboard-chart.component';

interface TaskStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
  todayTotal: number;
  todayCompleted: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    LoadingSpinnerComponent,
    DashboardChartComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <app-loading-spinner></app-loading-spinner>
      <app-header></app-header>
      
      <main class="flex-1 container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <!-- Total Tasks Card -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Total Tasks</h3>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ stats.total }}</p>
            <div class="flex items-center mt-2 text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {{ stats.active }} active, {{ stats.completed }} completed
              </span>
            </div>
          </div>
          
          <!-- Completion Rate Card -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Completion Rate</h3>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ stats.completionRate }}%</p>
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
              <div 
                class="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                [style.width]="stats.completionRate + '%'"
              ></div>
            </div>
          </div>
          
          <!-- Today's Tasks Card -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Today's Tasks</h3>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ stats.todayTotal }}</p>
            <div class="flex items-center mt-2 text-sm">
              <span class="text-gray-600 dark:text-gray-400">
                {{ stats.todayCompleted }} completed
              </span>
            </div>
          </div>
          
          <!-- Upcoming Tasks Card -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Upcoming Tasks</h3>
            <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ upcomingTasks.length }}</p>
            <div class="flex items-center mt-2 text-sm">
              <span class="text-gray-600 dark:text-gray-400">Due in the future</span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Tasks by Day Chart -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Tasks Per Day</h3>
            <app-dashboard-chart 
              [chartData]="tasksPerDayData"
              chartType="bar"
              [chartLabels]="tasksPerDayLabels"
              chartTitle="Tasks Per Day"
            ></app-dashboard-chart>
          </div>
          
          <!-- Tasks by Priority Chart -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">Tasks by Priority</h3>
            <app-dashboard-chart 
              [chartData]="tasksByPriorityData"
              chartType="doughnut"
              [chartLabels]="tasksByPriorityLabels"
              chartTitle="Tasks by Priority"
            ></app-dashboard-chart>
          </div>
        </div>
        
        <div class="mt-8">
          <h2 class="text-xl font-bold mb-4">Recent Tasks</h2>
          <div class="card">
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b dark:border-gray-700">
                    <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Task</th>
                    <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Priority</th>
                    <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Due Date</th>
                    <th class="text-left py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let task of recentTasks" class="border-b dark:border-gray-700">
                    <td class="py-3 px-4">{{ task.title }}</td>
                    <td class="py-3 px-4">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300': task.priority === 'High',
                          'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300': task.priority === 'Medium',
                          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300': task.priority === 'Low'
                        }"
                      >
                        {{ task.priority }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      {{ task.dueDate ? (task.dueDate | date:'MMM d, y') : 'No due date' }}
                    </td>
                    <td class="py-3 px-4">
                      <span 
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': task.status === 'Active',
                          'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300': task.status === 'Completed'
                        }"
                      >
                        {{ task.status }}
                      </span>
                    </td>
                  </tr>
                  <tr *ngIf="recentTasks.length === 0">
                    <td colspan="4" class="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                      No tasks found
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  recentTasks: Task[] = [];
  upcomingTasks: Task[] = [];
  
  // Chart data
  tasksPerDayLabels: string[] = [];
  tasksPerDayData: number[] = [];
  tasksByPriorityLabels: string[] = ['High', 'Medium', 'Low'];
  tasksByPriorityData: number[] = [0, 0, 0];
  
  stats: TaskStats = {
    total: 0,
    completed: 0,
    active: 0,
    completionRate: 0,
    todayTotal: 0,
    todayCompleted: 0
  };
  
  constructor(private taskService: TaskService) {}
  
  ngOnInit(): void {
    this.loadTasks();
  }
  
  loadTasks(): void {
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.calculateStats();
        this.prepareChartData();
        this.recentTasks = this.getRecentTasks();
        this.upcomingTasks = this.getUpcomingTasks();
      },
      error: (error) => {
        console.error('Error loading tasks', error);
      }
    });
  }
  
  calculateStats(): void {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    this.stats.total = this.tasks.length;
    this.stats.completed = this.tasks.filter(task => task.status === 'Completed').length;
    this.stats.active = this.tasks.filter(task => task.status === 'Active').length;
    this.stats.completionRate = this.stats.total > 0 
      ? Math.round((this.stats.completed / this.stats.total) * 100) 
      : 0;
    
    // Today's tasks
    this.stats.todayTotal = this.tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
      return dueDate >= startOfToday && dueDate <= endOfToday;
    }).length;
    
    this.stats.todayCompleted = this.tasks.filter(task => {
      if (!task.dueDate || task.status !== 'Completed') return false;
      const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
      return dueDate >= startOfToday && dueDate <= endOfToday;
    }).length;
  }
  
  prepareChartData(): void {
    // Tasks per day data (last 7 days)
    const today = new Date();
    const days = [];
    const counts = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'MMM d');
      days.push(dateString);
      
      const startDate = startOfDay(date);
      const endDate = endOfDay(date);
      
      const count = this.tasks.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
        return dueDate >= startDate && dueDate <= endDate;
      }).length;
      
      counts.push(count);
    }
    
    this.tasksPerDayLabels = days;
    this.tasksPerDayData = counts;
    
    // Tasks by priority data
    const highPriorityCount = this.tasks.filter(task => task.priority === 'High').length;
    const mediumPriorityCount = this.tasks.filter(task => task.priority === 'Medium').length;
    const lowPriorityCount = this.tasks.filter(task => task.priority === 'Low').length;
    
    this.tasksByPriorityData = [highPriorityCount, mediumPriorityCount, lowPriorityCount];
  }
  
  getRecentTasks(): Task[] {
    // Return the 5 most recently created tasks
    return [...this.tasks]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }
  
  getUpcomingTasks(): Task[] {
    const today = new Date();
    const startOfToday = startOfDay(today);
    
    return this.tasks.filter(task => {
      if (!task.dueDate || task.status === 'Completed') return false;
      const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
      return dueDate > startOfToday;
    });
  }
}