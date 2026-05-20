# TaskFlow Web — Angular 21

A full-featured productivity SaaS app built with Angular 21 and PrimeNG 21.

## Tech Stack
- Angular 21 (Standalone Components, Signals)
- PrimeNG 21
- Angular CDK (Drag & Drop)
- Chart.js
- SCSS with CSS Variables
- Glassmorphism pastel UI

## Screens
- Login / Register
- Dashboard (charts, stats, habits)
- Today's Tasks (drag & drop, priority board)
- Completed Tasks
- Calendar (month & week view)
- Notes (color coded, pin/unpin)
- Habit Tracker (progress rings, streaks)
- Profile & Settings
- Team Workspace (kanban board)

## Features
- Pastel glassmorphism UI
- Dark / Light mode
- Responsive layout
- JWT auth ready (mock for now)
- Signal-based state management
- Lazy loaded routes

## Run locally
npm install
ng serve

## Backend
Spring Boot backend coming soon.
API integration in progress.

## Project Structure
src/
├── app/
│   ├── core/          # guards, interceptors, models, services
│   ├── features/      # all screen components
│   ├── layout/        # sidebar, header, app-shell
│   └── shared/        # reusable components
└── styles/            # SCSS theme variables