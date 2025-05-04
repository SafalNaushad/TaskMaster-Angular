import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-md">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <a routerLink="/dashboard" class="font-bold text-xl text-primary-600 dark:text-primary-400 no-underline">Task Master</a>
          </div>
          
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex space-x-4 items-center">
            <a 
              routerLink="/dashboard" 
              routerLinkActive="text-primary-600 dark:text-primary-400" 
              [routerLinkActiveOptions]="{exact: true}"
              class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 no-underline"
            >
              Dashboard
            </a>
            
            <!-- Tasks Dropdown -->
            <div class="relative" #tasksDropdown>
              <button 
                class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 flex items-center"
                (click)="toggleTasksMenu()"
                (mouseenter)="showTasksMenu()"
              >
                Tasks
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                class="absolute left-0 w-48 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg transition-opacity duration-150"
                [class.hidden]="!isTasksMenuOpen"
                (mouseenter)="showTasksMenu()"
                (mouseleave)="hideTasksMenu()"
              >
                <a 
                  routerLink="/todo/all" 
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                  (click)="closeTasksMenu()"
                >
                  All Tasks
                </a>
                <a 
                  routerLink="/todo/upcoming" 
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                  (click)="closeTasksMenu()"
                >
                  Upcoming
                </a>
                <a 
                  routerLink="/todo/today" 
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                  (click)="closeTasksMenu()"
                >
                  Today
                </a>
                <a 
                  routerLink="/todo/completed" 
                  class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                  (click)="closeTasksMenu()"
                >
                  Completed
                </a>
              </div>
            </div>
            
            <!-- Theme Toggle -->
            <button 
              (click)="toggleTheme()" 
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              <svg *ngIf="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg *ngIf="!isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
            
            <!-- User Menu -->
<div class="relative ml-2" (mouseenter)="showUserMenu()" (mouseleave)="startHideUserMenu()">
  <button class="flex items-center focus:outline-none" (click)="toggleUserMenu()">
    <div class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
      {{ getUserInitial() }}
    </div>
  </button>

  <!-- Dropdown Menu -->
  <div
    class="absolute right-0 w-48 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10"
    [class.hidden]="!isUserMenuOpen"
  >
    <a
      routerLink="/profile"
      class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
    >
      Profile & Settings
    </a>
    <button
      (click)="logout()"
      class="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Logout
    </button>
  </div>
</div>

          </nav>
          
          <!-- Mobile Menu Button -->
          <div class="md:hidden">
            <button 
              (click)="toggleMobileMenu()" 
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg *ngIf="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div *ngIf="mobileMenuOpen" class="md:hidden">
        <div class="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" 
            [routerLinkActiveOptions]="{exact: true}"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
            (click)="toggleMobileMenu()"
          >
            Dashboard
          </a>
          
          <!-- Mobile Tasks Submenu -->
          <div>
            <button 
              (click)="toggleTasksSubmenu()" 
              class="w-full flex justify-between items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>Tasks</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" [class.transform]="tasksSubmenuOpen" [class.rotate-180]="tasksSubmenuOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div *ngIf="tasksSubmenuOpen" class="pl-4">
              <a 
                routerLink="/todo/all" 
                class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                (click)="toggleMobileMenu()"
              >
                All Tasks
              </a>
              <a 
                routerLink="/todo/upcoming" 
                class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                (click)="toggleMobileMenu()"
              >
                Upcoming
              </a>
              <a 
                routerLink="/todo/today" 
                class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                (click)="toggleMobileMenu()"
              >
                Today
              </a>
              <a 
                routerLink="/todo/completed" 
                class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
                (click)="toggleMobileMenu()"
              >
                Completed
              </a>
            </div>
          </div>
          
          <a 
            routerLink="/profile" 
            routerLinkActive="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400"
            class="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 no-underline"
            (click)="toggleMobileMenu()"
          >
            Profile & Settings
          </a>
          
          <div class="flex items-center justify-between px-4 py-2">
            <span class="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button 
              (click)="toggleTheme()" 
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              <svg *ngIf="isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg *ngIf="!isDarkMode" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
          
          <button 
            (click)="logout()" 
            class="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  mobileMenuOpen = false;
  tasksSubmenuOpen = false;
  isTasksMenuOpen = false;
  private hideTimeout: any;

  isUserMenuOpen = false;
  private hideDelay = 200; 
  
  constructor(
    private authService: AuthService, 
    private themeService: ThemeService
  ) {}
  
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.tasksSubmenuOpen = false;
    }
  }
  
  toggleTasksSubmenu(): void {
    this.tasksSubmenuOpen = !this.tasksSubmenuOpen;
  }
  
  toggleTasksMenu(): void {
    this.isTasksMenuOpen = !this.isTasksMenuOpen;
  }
  
  showTasksMenu(): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.isTasksMenuOpen = true;
  }
  
  hideTasksMenu(): void {
    this.hideTimeout = setTimeout(() => {
      this.isTasksMenuOpen = false;
    }, 200);
  }
  
  closeTasksMenu(): void {
    this.isTasksMenuOpen = false;
  }
  
  logout(): void {
    this.authService.logout();
  }
  
  getUserInitial(): string {
    const user = this.authService.getCurrentUser();
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  }

  // User Menu Hover and Click Logic

  showUserMenu(): void {
    this.isUserMenuOpen = true;  // Show menu on hover
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);  // Cancel hide timeout if the mouse enters
    }
  }

  // Start hide process if the mouse leaves the menu area
  startHideUserMenu(): void {
    this.hideTimeout = setTimeout(() => {
      this.isUserMenuOpen = false;
    }, this.hideDelay);
  }

  // Toggle dropdown open/close on button click
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);  // Cancel the hide timeout if it's open
      }
    } else {
      this.startHideUserMenu();  // Start the hide process when closing
    }
  }
}