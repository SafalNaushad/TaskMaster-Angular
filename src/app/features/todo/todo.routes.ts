import { Routes } from '@angular/router';
import { TodoListComponent } from './pages/todo-list/todo-list.component';

export const TODO_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full'
  },
  {
    path: 'all',
    component: TodoListComponent
  },
  {
    path: 'upcoming',
    component: TodoListComponent,
    data: { filter: 'upcoming' }
  },
  {
    path: 'today',
    component: TodoListComponent,
    data: { filter: 'today' }
  },
  {
    path: 'completed',
    component: TodoListComponent,
    data: { filter: 'completed' }
  }
];