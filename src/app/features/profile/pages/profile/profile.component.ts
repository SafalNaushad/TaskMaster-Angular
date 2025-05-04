import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <app-loading-spinner></app-loading-spinner>
      <app-header></app-header>
      
      <main class="flex-1 container mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold mb-6">Profile & Settings</h1>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div class="md:grid md:grid-cols-3">
            <!-- Profile Image Sidebar -->
            <div class="md:col-span-1 p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              <div class="flex flex-col items-center">
                <div class="relative">
                  <div class="h-32 w-32 rounded-full bg-primary-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                    {{ getInitials() }}
                  </div>
                  <label 
                    for="profileImage" 
                    class="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center cursor-pointer"
                    aria-label="Change profile picture"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input 
                    type="file" 
                    id="profileImage" 
                    accept="image/*" 
                    class="hidden" 
                  />
                </div>
                
                <h2 class="mt-4 text-xl font-semibold">{{ user?.username }}</h2>
                <p class="text-gray-600 dark:text-gray-400">{{ user?.email || 'No email provided' }}</p>
                
                <div class="mt-6 w-full">
                  <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</h3>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-700 dark:text-gray-300">
                      {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
                    </span>
                    <button 
                      (click)="toggleTheme()" 
                      class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      [class.bg-primary-600]="isDarkMode"
                      [class.bg-gray-300]="!isDarkMode"
                      aria-label="Toggle theme"
                    >
                      <span 
                        class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform"
                        [class.translate-x-6]="isDarkMode"
                        [class.translate-x-1]="!isDarkMode"
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Settings Form -->
            <div class="md:col-span-2 p-6">
              <h3 class="text-lg font-medium leading-6 mb-4">Profile Information</h3>
              
              <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6">
                <!-- Username -->
                <div>
                  <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    formControlName="username"
                    class="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    readonly
                  />
                </div>
                
                <!-- Email -->
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="input"
                    [ngClass]="{'border-error-500 ring-1 ring-error-500': isFieldInvalid('email')}"
                  />
                  <div *ngIf="isFieldInvalid('email')" class="error-text">
                    Please enter a valid email address
                  </div>
                </div>
                
                <!-- Change Password Section -->
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium mb-4">Change Password</h3>
                  
                  <!-- Current Password -->
                  <div class="mb-4">
                    <label for="currentPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div class="relative">
                      <input
                        [type]="showCurrentPassword ? 'text' : 'password'"
                        id="currentPassword"
                        formControlName="currentPassword"
                        class="input pr-10"
                        placeholder="Enter your current password"
                      />
                      <button
                        type="button"
                        (click)="toggleCurrentPasswordVisibility()"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        <svg *ngIf="!showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg *ngIf="showCurrentPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <!-- New Password -->
                  <div class="mb-4">
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div class="relative">
                      <input
                        [type]="showNewPassword ? 'text' : 'password'"
                        id="newPassword"
                        formControlName="newPassword"
                        class="input pr-10"
                        [ngClass]="{'border-error-500 ring-1 ring-error-500': isPasswordFieldInvalid('newPassword')}"
                        placeholder="Enter your new password"
                      />
                      <button
                        type="button"
                        (click)="toggleNewPasswordVisibility()"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        <svg *ngIf="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg *ngIf="showNewPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                    <div *ngIf="isPasswordFieldInvalid('newPassword')" class="error-text">
                      <span *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">
                        Password must be at least 8 characters
                      </span>
                      <span *ngIf="passwordForm.get('newPassword')?.errors?.['pattern']">
                        Password must contain at least 1 uppercase letter and 1 number
                      </span>
                    </div>
                  </div>
                  
                  <!-- Confirm New Password -->
                  <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div class="relative">
                      <input
                        [type]="showConfirmPassword ? 'text' : 'password'"
                        id="confirmPassword"
                        formControlName="confirmPassword"
                        class="input pr-10"
                        [ngClass]="{'border-error-500 ring-1 ring-error-500': isPasswordFieldInvalid('confirmPassword')}"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        (click)="toggleConfirmPasswordVisibility()"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                        aria-label="Toggle password visibility"
                      >
                        <svg *ngIf="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <svg *ngIf="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      </button>
                    </div>
                    <div *ngIf="isPasswordFieldInvalid('confirmPassword')" class="error-text">
                      <span *ngIf="passwordForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                        Passwords do not match
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- Additional Settings Section -->
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 class="text-lg font-medium mb-4">Notification Settings</h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-700 dark:text-gray-300 font-medium">Email Notifications</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive email notifications for task due dates</p>
                      </div>
                      <button 
                        type="button"
                        (click)="toggleEmailNotifications()" 
                        class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        [class.bg-primary-600]="profileForm.get('emailNotifications')?.value"
                        [class.bg-gray-300]="!profileForm.get('emailNotifications')?.value"
                        aria-label="Toggle email notifications"
                      >
                        <span 
                          class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform"
                          [class.translate-x-6]="profileForm.get('emailNotifications')?.value"
                          [class.translate-x-1]="!profileForm.get('emailNotifications')?.value"
                        ></span>
                      </button>
                    </div>
                    
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="text-gray-700 dark:text-gray-300 font-medium">Push Notifications</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Receive push notifications for task reminders</p>
                      </div>
                      <button 
                        type="button"
                        (click)="togglePushNotifications()" 
                        class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        [class.bg-primary-600]="profileForm.get('pushNotifications')?.value"
                        [class.bg-gray-300]="!profileForm.get('pushNotifications')?.value"
                        aria-label="Toggle push notifications"
                      >
                        <span 
                          class="inline-block h-4 w-4 rounded-full bg-white transform transition-transform"
                          [class.translate-x-6]="profileForm.get('pushNotifications')?.value"
                          [class.translate-x-1]="!profileForm.get('pushNotifications')?.value"
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Success/Error Message -->
                <div *ngIf="message" class="py-2 px-3 rounded-md text-sm" [ngClass]="
                  messageType === 'success' 
                    ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300' 
                    : 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300'
                ">
                  {{ message }}
                </div>
                
                <!-- Save Button -->
                <div class="flex justify-end">
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || isLoading"
                    class="btn-primary"
                    [ngClass]="{'opacity-70 cursor-not-allowed': profileForm.invalid || isLoading}"
                  >
                    <span *ngIf="isLoading" class="inline-block h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {{ isLoading ? 'Saving...' : 'Save Changes' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  user: User | null = null;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  
  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private http: HttpClient
  ) {}
  
  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.initForm();
  }
  
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  
  initForm(): void {
    this.profileForm = this.fb.group({
      username: [{ value: this.user?.username || '', disabled: true }],
      email: [this.user?.email || '', [Validators.email]],
      emailNotifications: [true],
      pushNotifications: [false],
      
      // Password fields
      currentPassword: [''],
      newPassword: ['', [
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*$/)
      ]],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator });
    
    // Create a getter for the password sub-form for easier validation
    this.passwordForm = this.fb.group({
      currentPassword: this.profileForm.get('currentPassword'),
      newPassword: this.profileForm.get('newPassword'),
      confirmPassword: this.profileForm.get('confirmPassword')
    }, { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (!newPassword && !confirmPassword) return null;
    
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
  
  isPasswordFieldInvalid(fieldName: string): boolean {
    // Only validate if the user has started to enter a new password
    const currentPassword = this.profileForm.get('currentPassword')?.value;
    const newPassword = this.profileForm.get('newPassword')?.value;
    
    if (!currentPassword && !newPassword) return false;
    
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
  
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
  
  toggleEmailNotifications(): void {
    const currentValue = this.profileForm.get('emailNotifications')?.value;
    this.profileForm.patchValue({ emailNotifications: !currentValue });
  }
  
  togglePushNotifications(): void {
    const currentValue = this.profileForm.get('pushNotifications')?.value;
    this.profileForm.patchValue({ pushNotifications: !currentValue });
  }
  
  toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }
  
  toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }
  
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.message = '';
    
    // Simulate API call
    setTimeout(() => {
      const formValue = this.profileForm.getRawValue();
      
      // Check if password needs to be updated
      const passwordChanged = !!formValue.currentPassword && !!formValue.newPassword;
      
      if (passwordChanged && !this.validatePasswordFields()) {
        this.isLoading = false;
        return;
      }
      
      // Simulate success
      this.message = 'Profile updated successfully';
      this.messageType = 'success';
      this.isLoading = false;
      
      // Reset password fields
      this.profileForm.patchValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1000);
  }
  
  validatePasswordFields(): boolean {
    const { currentPassword, newPassword, confirmPassword } = this.profileForm.value;
    
    if (currentPassword && (!newPassword || !confirmPassword)) {
      this.message = 'Please complete all password fields';
      this.messageType = 'error';
      return false;
    }
    
    if (newPassword !== confirmPassword) {
      this.message = 'New passwords do not match';
      this.messageType = 'error';
      return false;
    }
    
    return true;
  }
  
  getInitials(): string {
    if (!this.user?.username) return 'U';
    
    const names = this.user.username.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
}