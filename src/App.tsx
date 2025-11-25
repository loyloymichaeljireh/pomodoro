import React from 'react';
import { PomodoroTimer } from './components/PomodoroTimer';
export function App() {
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-text mb-3">
            Pomodoro Timer
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Stay focused, one pomodoro at a time
          </p>
        </header>

        <PomodoroTimer />
      </div>
    </div>;
}