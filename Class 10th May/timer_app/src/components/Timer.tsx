import * as React from "react";

export default function Timer() {
    const [inputSeconds, setInputSeconds] = React.useState<string>("");

    const [seconds, setSeconds] = React.useState<number>(0);

    const [isRunning, setIsRunning] = React.useState<boolean>(false);

    const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);


    function handleAdd(amount: number): void {
        setSeconds((prev: number) => prev + amount);
    }


    function handleStart(): void {
        if (isRunning) return;

        const time: number = Number(inputSeconds);

        if (time <= 0) return;

        setSeconds(time);
        setIsRunning(true);

        intervalRef.current = setInterval(() => {

            setSeconds((prev: number) => {

                if (prev <= 1) {

                    if (intervalRef.current !== null) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }

                    setIsRunning(false);

                    return 0;
                }

                return prev - 1;
            });

        }, 1000);
    }


    function handlePause(): void {
        setIsRunning(false);

        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }


    function handleReset(): void {
        setIsRunning(false);

        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        setSeconds(0);
        setInputSeconds("");
    }


    function formatTime(totalSeconds: number): string {
        const minutes: number = Math.floor(totalSeconds / 60);

        const remainingSeconds: number = totalSeconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }


    return (
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setInputSeconds(e.target.value)
                        }
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
                    {isRunning
                        ? "Running"
                        : seconds > 0
                            ? "Paused"
                            : "Ready"}
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
    );
}