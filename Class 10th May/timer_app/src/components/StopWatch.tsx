import * as React from 'react'

export default function StopWatch() {
    const [seconds, setSeconds] = React.useState(0);
    const [isRunning, setIsRunning] = React.useState(false);
     
    React.useEffect(() => {
        if(!isRunning) return;

        const intervalId = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, [isRunning]);

    function handleStart() {
        setIsRunning(true);
    }

    function handlePause() {
        setIsRunning(false);
    }

    function handleReset() {
        setIsRunning(false);
        setSeconds(0);
    }

    return (
        <div className="timer-content">
    
            <div className="time-display stopwatch-display">
    
                <span className="time-value">
                    {String(Math.floor(seconds / 60)).padStart(2, "0")}
                    <span className="time-separator">:</span>
                    {String(seconds % 60).padStart(2, "0")}
                </span>
    
                <span className="time-caption">
                    {isRunning ? "Running" : seconds > 0 ? "Paused" : "Ready"}
                </span>
    
            </div>
    
    
            <div className="control-row">
    
                {!isRunning ? (
                    <button
                        className="primary-button"
                        onClick={handleStart}
                    >
                        {seconds === 0 ? "Start" : "Resume"}
                    </button>
                ) : (
                    <button
                        className="primary-button"
                        onClick={handlePause}
                    >
                        Pause
                    </button>
                )}
    
                <button
                    className="ghost-button"
                    onClick={handleReset}
                >
                    Reset
                </button>
    
            </div>
    
        </div>
    )
}
