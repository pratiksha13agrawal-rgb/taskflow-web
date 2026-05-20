import { Component, OnInit, Renderer2, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class App implements OnInit {
  constructor(private renderer: Renderer2) {}
  ngOnInit(): void {
    const saved = localStorage.getItem('theme') ?? 'light';
    this.renderer.setAttribute(document.documentElement, 'data-theme', saved);
  }
}
