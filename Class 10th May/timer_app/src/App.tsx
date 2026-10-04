import * as React from 'react'
import './App.css'
import Timer from './components/Timer';
import StopWatch from './components/StopWatch';

function App() {
  const [timer, setTimer] = React.useState(true);

  
  return (
    <main className="app-shell">
  
      <header className="topbar">
  
        <div className="brand">
          <div className="brand-mark">T</div>
  
          <div>
            <span className="brand-name">Tempo</span>
            <span className="brand-subtitle">Time tools</span>
          </div>
        </div>
  
        <div className="mode-switcher">
          <button
            className={timer ? "mode-button active" : "mode-button"}
            onClick={() => setTimer(true)}
          >
            Timer
          </button>
  
          <button
            className={!timer ? "mode-button active" : "mode-button"}
            onClick={() => setTimer(false)}
          >
            Stopwatch
          </button>
        </div>
  
        <div className="status-pill">
          <span className="status-dot" />
          Ready
        </div>
  
      </header>
  
  
      <section className="workspace">
  
        <div className="eyebrow">
          {timer ? "COUNTDOWN TIMER" : "STOPWATCH"}
        </div>
  
        <h1 className="page-title">
          {timer ? "Time, on your terms." : "Every second counts."}
        </h1>
  
        <p className="page-description">
          {timer
            ? "Set a duration and let the clock do the rest."
            : "A simple, precise stopwatch for whatever you're timing."
          }
        </p>
  
  
        <div className="timer-card">
          {timer ? <Timer /> : <StopWatch />}
        </div>
  
      </section>
  
  
      <footer className="footer">
        <span>Tempo</span>
        <span>Built with React</span>
      </footer>
  
    </main>
  );
}

export default App;
