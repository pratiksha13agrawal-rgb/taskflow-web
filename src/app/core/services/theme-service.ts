import { Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;

  isDark = signal<boolean>(false);

  constructor(factory: RendererFactory2) {
    this.renderer = factory.createRenderer(null, null);
    const saved   = localStorage.getItem('theme') ?? 'light';
    this.isDark.set(saved === 'dark');
    this.applyTheme(saved === 'dark');
  }

  toggle(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    this.applyTheme(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  private applyTheme(dark: boolean): void {
    this.renderer.setAttribute(
      document.documentElement,
      'data-theme',
      dark ? 'dark' : 'light'
    );
  }

}
