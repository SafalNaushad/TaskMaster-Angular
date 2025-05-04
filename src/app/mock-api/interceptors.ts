/**
 * This file can be imported in your main.ts to add mock API interceptors for development purposes.
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// Mock user data
const USERS = [
  { userId: '1', username: 'user', email: 'user@example.com', password: 'Password123' }
];

// Mock tasks data
let TASKS = [
  {
    id: '1',
    userId: '1',
    title: 'Complete project documentation',
    description: 'Write detailed documentation for the Task Master project.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    priority: 'High',
    status: 'Active',
    tags: ['Documentation', 'Important'],
    recurrence: null,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
  },
  {
    id: '2',
    userId: '1',
    title: 'Daily standup meeting',
    description: 'Attend daily standup meeting with the team.',
    dueDate: new Date(new Date().setHours(10, 0, 0, 0)),
    priority: 'Medium',
    status: 'Active',
    tags: ['Meeting', 'Daily'],
    recurrence: 'Daily',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 5))
  },
  {
    id: '3',
    userId: '1',
    title: 'Review pull requests',
    description: 'Review and approve pending pull requests from the development team.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    priority: 'Medium',
    status: 'Active',
    tags: ['Development', 'Code-Review'],
    recurrence: null,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    id: '4',
    userId: '1',
    title: 'Update dependencies',
    description: 'Update project dependencies to the latest versions.',
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    priority: 'Low',
    status: 'Active',
    tags: ['Maintenance'],
    recurrence: null,
    createdAt: new Date(new Date().setDate(new Date().getDate() - 3))
  },
  {
    id: '5',
    userId: '1',
    title: 'Send weekly report',
    description: 'Prepare and send the weekly progress report to stakeholders.',
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    priority: 'High',
    status: 'Completed',
    tags: ['Report', 'Weekly'],
    recurrence: 'Weekly',
    createdAt: new Date(new Date().setDate(new Date().getDate() - 7))
  }
];

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Simulate token generation
const generateToken = (userId: string) => `mock-jwt-token-${userId}-${Date.now()}`;

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  // Add random delay to simulate network latency
  const delay$ = delay(Math.random() * 800 + 200);
  
  // Authentication endpoints
  if (req.url.endsWith('/api/login') && req.method === 'POST') {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username && u.password === password);
    
    if (user) {
      const response = {
        token: generateToken(user.userId),
        userId: user.userId,
        username: user.username
      };
      return of(new Response(JSON.stringify(response), { status: 200 })).pipe(delay$);
    } else {
      return throwError(() => new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 })).pipe(delay$);
    }
  }
  
  if (req.url.endsWith('/api/register') && req.method === 'POST') {
    const { username, email, password } = req.body;
    
    // Check if username or email already exists
    if (USERS.some(u => u.username === username)) {
      return throwError(() => new Response(JSON.stringify({ message: 'Username already exists' }), { status: 400 })).pipe(delay$);
    }
    if (USERS.some(u => u.email === email)) {
      return throwError(() => new Response(JSON.stringify({ message: 'Email already exists' }), { status: 400 })).pipe(delay$);
    }
    
    // Create new user
    const userId = generateId();
    USERS.push({ userId, username, email, password });
    
    const response = {
      token: generateToken(userId),
      userId,
      username
    };
    return of(new Response(JSON.stringify(response), { status: 201 })).pipe(delay$);
  }
  
  // Task endpoints
  if (req.url.endsWith('/api/Todo') && req.method === 'GET') {
    return of(new Response(JSON.stringify(TASKS), { status: 200 })).pipe(delay$);
  }
  
  if (req.url.endsWith('/api/Todo') && req.method === 'POST') {
    const newTask = {
      ...req.body,
      id: generateId(),
      userId: '1', // In a real app, this would come from the JWT token
      createdAt: new Date(),
      status: 'Active'
    };
    
    TASKS.push(newTask);
    return of(new Response(JSON.stringify(newTask), { status: 201 })).pipe(delay$);
  }
  
  if (req.url.match(/\/api\/Todo\/\w+$/) && req.method === 'PUT') {
    const id = req.url.split('/').pop();
    const taskIndex = TASKS.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return throwError(() => new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 })).pipe(delay$);
    }
    
    TASKS[taskIndex] = { ...TASKS[taskIndex], ...req.body };
    return of(new Response(JSON.stringify(TASKS[taskIndex]), { status: 200 })).pipe(delay$);
  }
  
  if (req.url.match(/\/api\/Todo\/\w+$/) && req.method === 'DELETE') {
    const id = req.url.split('/').pop();
    const taskIndex = TASKS.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return throwError(() => new Response(JSON.stringify({ message: 'Task not found' }), { status: 404 })).pipe(delay$);
    }
    
    TASKS = TASKS.filter(task => task.id !== id);
    return of(new Response(JSON.stringify({ success: true }), { status: 200 })).pipe(delay$);
  }
  
  // If no mock endpoint matches, pass the request through
  return next(req);
};