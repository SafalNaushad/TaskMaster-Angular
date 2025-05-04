import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, CreateTaskDto, UpdateTaskDto } from '../models/task.model';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // private readonly API_URL = 'http://localhost:5176/api/Todo';
    private readonly API_URL = environment.apiUrl + 'Todo';
  
  constructor(private http: HttpClient) {}
  
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.API_URL);
  }
  
  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`);
  }
  
  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task);
  }
  
  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${id}`, task);
  }
  
  deleteTask(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.API_URL}/${id}`);
  }
  
  getTodayTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/today`);
  }
  
  getUpcomingTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/upcoming`);
  }
  
  getCompletedTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.API_URL}/completed`);
  }
}