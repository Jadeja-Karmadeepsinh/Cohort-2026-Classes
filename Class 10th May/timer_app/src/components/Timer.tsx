import * as React from "react";

export default function Timer() {

    const [inputSeconds, setInputSeconds] = React.useState("");
    const [seconds, setSeconds] = React.useState(0);

    const [isRunning, setIsRunning] = React.useState(false);

    const intervalRef = React.useRef(null);


    function handleAdd(amount) {

        setSeconds(prev => prev + amount);

    }


    function handleStart() {

        if (isRunning) return;

        const time = Number(inputSeconds);

        if (time <= 0) return;

        setSeconds(time);
        setIsRunning(true);

        intervalRef.current = setInterval(() => {

            setSeconds(prev => {

                if (prev <= 1) {

                    clearInterval(intervalRef.current);
                    setIsRunning(false);

                    return 0;
                }

                return prev - 1;

            });

        }, 1000);
    }


    function handlePause() {

        setIsRunning(false);

        clearInterval(intervalRef.current);
    }


    function handleReset() {

        setIsRunning(false);

        clearInterval(intervalRef.current);

        setSeconds(0);
        setInputSeconds("");
    }


    function formatTime(totalSeconds) {

        const minutes = Math.floor(totalSeconds / 60);

        const seconds = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }


    return (
        <>
            <div className="timer-content">

            <div className="input-section">
                
                <label className="input-label">
                    Duration
                </label>
                
                <div className="duration-input-wrap">
                
                    <input
                        className="duration-input"
                        type="number"
                        value={inputSeconds}
                        onChange={(e) => setInputSeconds(e.target.value)}
                        placeholder="Enter seconds"
                        disabled={isRunning}
                    />
            
                    <span className="input-unit">
                        SEC
                    </span>
                
                </div>
                
            </div>
                
                
            <div className="time-display">
                <span className="time-value">
                    {formatTime(seconds)}
                </span>
                
                <span className="time-caption">
                    {isRunning ? "Running" : seconds > 0 ? "Paused" : "Ready"}
                </span>
            </div>
                
                
            <div className="quick-actions">
                
                <button
                    className="secondary-button"
                    onClick={() => handleAdd(60)}
                    disabled={!isRunning}
                >
                    +1 min
                </button>
                
                <button
                    className="secondary-button"
                    onClick={() => handleAdd(300)}
                    disabled={!isRunning}
                >
                    +5 min
                </button>
                
            </div>
                
                
            <div className="control-row">
                
                {isRunning ? (
                    <button
                        className="primary-button"
                        onClick={handlePause}
                    >
                        Pause
                    </button>
                ) : (
                    <button
                        className="primary-button"
                        onClick={handleStart}
                    >
                        {seconds > 0 ? "Resume" : "Start"}
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
        </>
    );
}