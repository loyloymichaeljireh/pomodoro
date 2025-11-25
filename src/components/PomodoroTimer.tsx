import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Settings, Volume2, VolumeX, Target } from 'lucide-react';
import { SteamAnimation } from './SteamAnimation';
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
const TIMER_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};
const MODE_LABELS = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break'
};
interface PomodoroStats {
  completedSessions: number;
  dailyGoal: number;
  currentTask: string;
  autoStart: boolean;
  soundEnabled: boolean;
}
export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[mode]);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [stats, setStats] = useState<PomodoroStats>(() => {
    const saved = localStorage.getItem('pomodoroStats');
    return saved ? JSON.parse(saved) : {
      completedSessions: 0,
      dailyGoal: 8,
      currentTask: '',
      autoStart: false,
      soundEnabled: true
    };
  });
  useEffect(() => {
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  }, [stats]);
  useEffect(() => {
    setTimeLeft(TIMER_DURATIONS[mode]);
    setIsRunning(false);
  }, [mode]);
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, mode]);
  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1
      }));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    if (stats.soundEnabled) {
      playCompletionSound();
    }
    if (stats.autoStart) {
      setTimeout(() => {
        if (mode === 'focus') {
          setMode(stats.completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak');
        } else {
          setMode('focus');
        }
        setIsRunning(true);
      }, 2000);
    }
  };
  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };
  const resetDailyStats = () => {
    setStats(prev => ({
      ...prev,
      completedSessions: 0
    }));
  };
  const progress = timeLeft / TIMER_DURATIONS[mode] * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - progress / 100 * circumference;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const goalProgress = stats.completedSessions / stats.dailyGoal * 100;
  return <div className="relative w-full max-w-2xl mx-auto">
      <SteamAnimation />

      {/* Task Input */}
      <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      ease: 'easeOut',
      delay: 0.1
    }} className="mb-8">
        <input type="text" value={stats.currentTask} onChange={e => setStats(prev => ({
        ...prev,
        currentTask: e.target.value
      }))} placeholder="What are you working on?" className="w-full bg-card/50 backdrop-blur-sm text-text placeholder:text-text-secondary/60 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:outline-none transition-colors text-center text-lg font-light" />
      </motion.div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6,
      ease: 'easeOut'
    }} className="relative bg-card rounded-3xl shadow-cafe p-8 md:p-12">
        {/* Settings Toggle */}
        <motion.button onClick={() => setShowSettings(!showSettings)} className="absolute top-6 right-6 p-2 rounded-xl text-text-secondary hover:text-text hover:bg-background transition-colors" whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <Settings className="w-5 h-5" />
        </motion.button>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="mb-6 overflow-hidden">
              <div className="bg-background rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Auto-start sessions
                  </span>
                  <button onClick={() => setStats(prev => ({
                ...prev,
                autoStart: !prev.autoStart
              }))} className={`w-12 h-6 rounded-full transition-colors ${stats.autoStart ? 'bg-primary' : 'bg-secondary/30'}`}>
                    <motion.div className="w-5 h-5 bg-background rounded-full shadow-sm" animate={{
                  x: stats.autoStart ? 26 : 2
                }} transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30
                }} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Sound notifications
                  </span>
                  <button onClick={() => setStats(prev => ({
                ...prev,
                soundEnabled: !prev.soundEnabled
              }))} className="p-2 rounded-lg hover:bg-secondary/20 transition-colors">
                    {stats.soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-text-secondary" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-secondary/20">
                  <span className="text-sm text-text-secondary">
                    Daily goal
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setStats(prev => ({
                  ...prev,
                  dailyGoal: Math.max(1, prev.dailyGoal - 1)
                }))} className="w-7 h-7 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-text flex items-center justify-center transition-colors">
                      -
                    </button>
                    <span className="text-sm font-medium text-text w-8 text-center">
                      {stats.dailyGoal}
                    </span>
                    <button onClick={() => setStats(prev => ({
                  ...prev,
                  dailyGoal: prev.dailyGoal + 1
                }))} className="w-7 h-7 rounded-lg bg-secondary/20 hover:bg-secondary/30 text-text flex items-center justify-center transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>}
        </AnimatePresence>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-12 bg-background rounded-2xl p-1.5">
          {(Object.keys(MODE_LABELS) as TimerMode[]).map(m => <motion.button key={m} onClick={() => setMode(m)} className="relative flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors" whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
              {mode === m && <motion.div layoutId="activeMode" className="absolute inset-0 bg-primary rounded-xl" transition={{
            type: 'spring',
            bounce: 0.2,
            duration: 0.6
          }} />}
              <span className={`relative z-10 ${mode === m ? 'text-background' : 'text-text-secondary'}`}>
                {MODE_LABELS[m]}
              </span>
            </motion.button>)}
        </div>

        {/* Circular Timer */}
        <div className="relative flex items-center justify-center mb-12">
          {/* Celebration Animation */}
          <AnimatePresence>
            {showCelebration && <motion.div initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1.2,
            opacity: 1
          }} exit={{
            scale: 1.4,
            opacity: 0
          }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-6xl">☕</div>
              </motion.div>}
          </AnimatePresence>

          <svg className="transform -rotate-90" width="280" height="280">
            <circle cx="140" cy="140" r="120" stroke="currentColor" strokeWidth="8" fill="none" className="text-background opacity-50" />
            <motion.circle cx="140" cy="140" r="120" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" className="text-primary" style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }} initial={false} animate={{
            strokeDashoffset
          }} transition={{
            duration: 0.5,
            ease: 'easeInOut'
          }} />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={`${minutes}-${seconds}`} initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.9
            }} transition={{
              duration: 0.2
            }} className="text-center">
                <div className="text-6xl md:text-7xl font-light text-text tabular-nums tracking-tight">
                  {String(minutes).padStart(2, '0')}:
                  {String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-text-secondary mt-2 font-medium uppercase tracking-wider">
                  {MODE_LABELS[mode]}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.button onClick={toggleTimer} className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-background shadow-button hover:shadow-button-hover transition-shadow" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}>
            {isRunning ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6 ml-0.5" fill="currentColor" />}
          </motion.button>

          <motion.button onClick={resetTimer} className="flex items-center justify-center w-12 h-12 rounded-full bg-background text-text-secondary hover:text-text hover:bg-secondary/20 transition-colors" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}>
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Stats Bar */}
        <div className="bg-background rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-primary" />
              <span className="text-sm text-text-secondary">
                Today's Sessions
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-text tabular-nums">
                {stats.completedSessions}/{stats.dailyGoal}
              </span>
              {stats.completedSessions > 0 && <button onClick={resetDailyStats} className="text-xs text-text-secondary hover:text-text transition-colors">
                  Reset
                </button>}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{
            width: 0
          }} animate={{
            width: `${Math.min(goalProgress, 100)}%`
          }} transition={{
            duration: 0.5,
            ease: 'easeOut'
          }} />
          </div>

          {/* Coffee Bean Indicators */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {[...Array(stats.dailyGoal)].map((_, i) => <motion.div key={i} initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: i * 0.05
          }} className={`text-lg ${i < stats.completedSessions ? 'opacity-100' : 'opacity-20'}`}>
                ☕
              </motion.div>)}
          </div>
        </div>
      </motion.div>
    </div>;
}