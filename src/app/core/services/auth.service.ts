import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserCredentials, RegisterUser, AuthResponse } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../../environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private readonly API_URL = 'http://localhost:5176/api/Auth';
  private readonly API_URL = environment.apiUrl + 'Auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  register(userData: RegisterUser): Observable<void> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(() => void 0),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Registration failed'));
      })
    );
  }
  
  login(credentials: UserCredentials): Observable<void> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(() => void 0),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Invalid credentials'));
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    const { token, userId, username } = response;
    const user: User = { userId, username };
    
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.userSubject.next(user);
  }
  
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  }
}