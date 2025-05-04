import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<Theme>(this.getStoredTheme());
  
  public theme$ = this.themeSubject.asObservable();
  
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }
  
  initTheme(): void {
    const theme = this.getStoredTheme();
    this.setTheme(theme);
  }
  
  toggleTheme(): void {
    const newTheme = this.themeSubject.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
  
  setTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
    this.themeSubject.next(theme);
    
    if (theme === 'dark') {
      this.renderer.addClass(document.documentElement, 'dark');
    } else {
      this.renderer.removeClass(document.documentElement, 'dark');
    }
  }
  
  isDarkMode(): boolean {
    return this.themeSubject.value === 'dark';
  }
  
  private getStoredTheme(): Theme {
    const storedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    
    if (storedTheme) {
      return storedTheme;
    }
    
    // Check user preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }
}