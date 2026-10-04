import * as React from "react";

type Player = "X" | "O";
type Cell = Player | "";
type Result = Player | "Draw" | null;

type Move = {
  player: Player;
  position: number;
};

const winningPatterns: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const positionNames = [
  "Top left",
  "Top center",
  "Top right",
  "Middle left",
  "Center",
  "Middle right",
  "Bottom left",
  "Bottom center",
  "Bottom right",
];

function App() {
  const [player, setPlayer] = React.useState<Player>("X");

  const [board, setBoard] = React.useState<Cell[]>(
    new Array(9).fill("")
  );

  const [result, setResult] = React.useState<Result>(null);

  const [moves, setMoves] = React.useState<Move[]>([]);

  const [scores, setScores] = React.useState({
    X: 0,
    O: 0,
    draws: 0,
  });

  const [winningCells, setWinningCells] = React.useState<number[]>([]);

  const [lastMove, setLastMove] = React.useState<number | null>(null);

  const [isResetting, setIsResetting] = React.useState(false);

  function checkWinner(currentBoard: Cell[], currentPlayer: Player) {
    const winningPattern = winningPatterns.find((pattern) =>
      pattern.every((position) => currentBoard[position] === currentPlayer)
    );

    return winningPattern ?? null;
  }

  function handleClick(idx: number): void {
    if (board[idx] !== "" || result !== null) return;

    const newBoard = [...board];

    newBoard[idx] = player;

    setBoard(newBoard);
    setLastMove(idx);

    const newMove: Move = {
      player,
      position: idx,
    };

    setMoves((prev) => [...prev, newMove]);

    const winner = checkWinner(newBoard, player);

    if (winner) {
      setWinningCells(winner);
      setResult(player);

      setScores((prev) => ({
        ...prev,
        [player]: prev[player] + 1,
      }));

      return;
    }

    const isBoardFull = newBoard.every((cell) => cell !== "");

    if (isBoardFull) {
      setResult("Draw");

      setScores((prev) => ({
        ...prev,
        draws: prev.draws + 1,
      }));

      return;
    }

    setPlayer((prev) => (prev === "X" ? "O" : "X"));
  }

  function handleReset(): void {
    setIsResetting(true);

    setTimeout(() => {
      setBoard(new Array(9).fill(""));
      setPlayer("X");
      setResult(null);
      setMoves([]);
      setWinningCells([]);
      setLastMove(null);
      setIsResetting(false);
    }, 250);
  }

  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClick(index);
    }
  }

  const totalMoves = moves.length;

  const currentStatus =
    result === "Draw"
      ? "Game ended in a draw"
      : result !== null
        ? `Player ${result} wins`
        : `Player ${player}'s turn`;

  const statusDescription =
    result === "Draw"
      ? "Perfectly balanced. Neither player could take the final line."
      : result !== null
        ? `Player ${result} completed three in a row.`
        : `Choose an empty square to place your ${player}.`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050507] text-white">
      {/* Ambient background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />

        <div className="absolute bottom-[-300px] left-[-180px] h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[130px]" />

        <div className="absolute right-[-180px] top-[30%] h-[450px] w-[450px] rounded-full bg-white/[0.02] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      {/* Main content */}

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-5 py-6 sm:px-8 sm:py-10 lg:px-10">

        {/* Top navigation */}

        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/10 bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,.25)]">
              <div className="text-[15px] font-semibold tracking-[-0.05em]">
                X<span className="text-white/35">O</span>
              </div>
            </div>

            <div>
              <p className="text-[13px] font-medium tracking-tight text-white/90">
                Tic Tac Toe
              </p>

              <p className="text-[11px] text-white/35">
                Two player game
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                result ? "bg-white/30" : "bg-white"
              }`}
            />

            <span className="text-[11px] font-medium text-white/50">
              {result ? "Game complete" : "Live game"}
            </span>
          </div>
        </header>

        {/* Game area */}

        <section className="flex flex-1 items-center justify-center py-12 sm:py-16 lg:py-12">
          <div className="grid w-full max-w-[960px] grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-14">

            {/* Left information panel */}

            <aside className="order-2 hidden lg:block">
              <div className="space-y-4">

                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,.25)] backdrop-blur-2xl">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Scoreboard
                    </span>

                    <span className="text-[10px] text-white/20">
                      This session
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <ScoreCard
                      label="Player X"
                      value={scores.X}
                      active={player === "X" && !result}
                    />

                    <ScoreCard
                      label="Draws"
                      value={scores.draws}
                      active={result === "Draw"}
                    />

                    <ScoreCard
                      label="Player O"
                      value={scores.O}
                      active={player === "O" && !result}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-2xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Match details
                    </span>

                    <span className="font-mono text-[11px] text-white/20">
                      #{String(totalMoves).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <InfoRow
                      label="Moves played"
                      value={`${totalMoves} / 9`}
                    />

                    <InfoRow
                      label="Remaining"
                      value={`${9 - totalMoves}`}
                    />

                    <InfoRow
                      label="Mode"
                      value="2 Players"
                    />
                  </div>
                </div>

              </div>
            </aside>

            {/* Game */}

            <div className="order-1 flex flex-col items-center lg:order-2">

              {/* Heading */}

              <div className="mb-8 text-center">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-white/10" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/30">
                    {result ? "Final result" : "Make your move"}
                  </span>

                  <span className="h-px w-8 bg-white/10" />
                </div>

                <h1 className="text-[42px] font-semibold leading-none tracking-[-0.055em] text-white sm:text-[52px]">
                  {result === "Draw"
                    ? "A Draw."
                    : result
                      ? `${result} Wins.`
                      : "Your Move."}
                </h1>

                <p className="mt-3 text-[13px] leading-relaxed text-white/35">
                  {statusDescription}
                </p>
              </div>

              {/* Player indicator */}

              <div className="mb-5 flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.035] p-1 backdrop-blur-xl">
                <PlayerBadge
                  player="X"
                  active={player === "X" && !result}
                  score={scores.X}
                />

                <div className="px-2 text-[10px] font-medium text-white/20">
                  VS
                </div>

                <PlayerBadge
                  player="O"
                  active={player === "O" && !result}
                  score={scores.O}
                />
              </div>

              {/* Board */}

              <div
                className={`relative rounded-[31px] border border-white/[0.09] bg-white/[0.025] p-2.5 shadow-[0_30px_100px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-2xl transition-all duration-300 sm:p-3 ${
                  isResetting
                    ? "scale-[0.96] opacity-40"
                    : "scale-100 opacity-100"
                }`}
              >
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">

                  {board.map((cell, index) => {
                    const isWinningCell = winningCells.includes(index);
                    const isLastMove = lastMove === index;

                    return (
                      <button
                        key={index}
                        type="button"
                        aria-label={
                          cell
                            ? `${positionNames[index]}, ${cell}`
                            : `${positionNames[index]}, empty`
                        }
                        disabled={cell !== "" || result !== null}
                        onClick={() => handleClick(index)}
                        onKeyDown={(event) =>
                          handleCellKeyDown(event, index)
                        }
                        className={`
                          group relative flex aspect-square
                          w-[clamp(82px,22vw,112px)]
                          items-center justify-center
                          overflow-hidden rounded-[22px]
                          border
                          transition-all duration-200
                          sm:rounded-[24px]
                          ${
                            isWinningCell
                              ? "border-white/30 bg-white/[0.13] shadow-[0_0_35px_rgba(255,255,255,.08)]"
                              : cell
                                ? "border-white/[0.10] bg-white/[0.055]"
                                : "border-white/[0.055] bg-white/[0.025] hover:border-white/[0.14] hover:bg-white/[0.055]"
                          }
                          ${
                            !cell && !result
                              ? "cursor-pointer hover:-translate-y-0.5 active:scale-[0.96]"
                              : "cursor-default"
                          }
                          ${
                            isLastMove && !result
                              ? "ring-1 ring-white/20"
                              : ""
                          }
                        `}
                      >

                        {/* Hover highlight */}

                        {!cell && !result && (
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        )}

                        {/* Cell number */}

                        {!cell && (
                          <span className="pointer-events-none absolute right-3 top-2.5 text-[9px] font-medium text-white/[0.12]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        )}

                        {/* Symbol */}

                        {cell === "X" && (
                          <XMark
                            winning={isWinningCell}
                          />
                        )}

                        {cell === "O" && (
                          <OMark
                            winning={isWinningCell}
                          />
                        )}

                        {/* Last move indicator */}

                        {isLastMove && !result && (
                          <span className="absolute bottom-2.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white/30" />
                        )}

                      </button>
                    );
                  })}

                </div>
              </div>

              {/* Status */}

              <div className="mt-6 flex min-h-[46px] items-center justify-center">
                {result ? (
                  <div className="animate-[fadeUp_.4s_ease-out] text-center">
                    <p className="text-[13px] font-medium text-white/70">
                      {currentStatus}
                    </p>

                    <p className="mt-1 text-[11px] text-white/25">
                      {result === "Draw"
                        ? "Every square was claimed."
                        : "Three in a row. Well played."}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[12px] text-white/30">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-semibold text-white/60">
                      {player}
                    </span>

                    <span>
                      Select an empty square
                    </span>
                  </div>
                )}
              </div>

              {/* Reset */}

              <button
                type="button"
                onClick={handleReset}
                className="group mt-2 flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-5 py-2.5 text-[12px] font-medium text-white/55 shadow-[0_10px_30px_rgba(0,0,0,.18)] backdrop-blur-xl transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white active:scale-95"
              >
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 4v6h6" />
                </svg>

                New game
              </button>

            </div>

            {/* Right information panel */}

            <aside className="order-3 hidden lg:block">
              <div className="space-y-4">

                {/* Move history */}

                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.035] p-5 shadow-[0_20px_70px_rgba(0,0,0,.25)] backdrop-blur-2xl">

                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      Move history
                    </span>

                    <span className="text-[10px] text-white/20">
                      {moves.length} moves
                    </span>
                  </div>

                  {moves.length === 0 ? (
                    <div className="flex min-h-[120px] flex-col items-center justify-center text-center">
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.025] text-[11px] text-white/20">
                        —
                      </div>

                      <p className="text-[11px] text-white/25">
                        No moves yet
                      </p>

                      <p className="mt-1 text-[10px] text-white/15">
                        The match history will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[205px] space-y-1.5 overflow-y-auto pr-1">
                      {moves.map((move, index) => (
                        <div
                          key={`${move.position}-${index}`}
                          className="flex items-center justify-between rounded-[12px] border border-white/[0.045] bg-white/[0.02] px-3 py-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-[9px] text-white/20">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span
                              className={`text-[11px] font-semibold ${
                                move.player === "X"
                                  ? "text-white/75"
                                  : "text-white/40"
                              }`}
                            >
                              {move.player}
                            </span>
                          </div>

                          <span className="text-[10px] text-white/20">
                            {positionNames[move.position]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Rules */}

                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-2xl">

                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04]">
                      <svg
                        className="h-3 w-3 text-white/35"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 10v6" />
                        <path d="M12 7h.01" />
                      </svg>
                    </div>

                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30">
                      How to play
                    </span>
                  </div>

                  <div className="space-y-3 text-[11px] leading-relaxed text-white/30">
                    <p>
                      Take turns placing your mark on an empty square.
                    </p>

                    <p>
                      Complete a row, column, or diagonal of three to win.
                    </p>

                    <p>
                      If all nine squares are filled without a winner, the
                      game ends in a draw.
                    </p>
                  </div>

                </div>

              </div>
            </aside>

          </div>
        </section>

        {/* Mobile stats */}

        <div className="mb-8 grid grid-cols-3 gap-2 lg:hidden">
          <MobileStat
            label="X wins"
            value={scores.X}
          />

          <MobileStat
            label="Draws"
            value={scores.draws}
          />

          <MobileStat
            label="O wins"
            value={scores.O}
          />
        </div>

        {/* Footer */}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-5 text-[10px] text-white/20 sm:flex-row">
          <span>
            Tic Tac Toe
          </span>

          <div className="flex items-center gap-3">
            <span>
              {totalMoves} / 9 moves
            </span>

            <span className="h-1 w-1 rounded-full bg-white/10" />

            <span>
              React + TypeScript
            </span>
          </div>
        </footer>

      </div>

      {/* Result overlay particles */}

      {result && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-[20%] h-1 w-1 animate-[particle1_1.8s_ease-out_forwards] rounded-full bg-white/40" />
          <div className="absolute left-[70%] top-[25%] h-1.5 w-1.5 animate-[particle2_2s_ease-out_forwards] rounded-full bg-white/30" />
          <div className="absolute left-[35%] top-[70%] h-1 w-1 animate-[particle3_1.6s_ease-out_forwards] rounded-full bg-white/30" />
          <div className="absolute left-[80%] top-[65%] h-1 w-1 animate-[particle1_2.1s_ease-out_forwards] rounded-full bg-white/20" />
        </div>
      )}

      <style>{`
        @keyframes markIn {
          0% {
            opacity: 0;
            transform: scale(.55) rotate(-8deg);
          }
          65% {
            opacity: 1;
            transform: scale(1.08) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes ringIn {
          0% {
            opacity: 0;
            transform: scale(.5);
          }
          70% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes winPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes particle1 {
          0% {
            opacity: 0;
            transform: translate(0, 20px) scale(.5);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(20px, -100px) scale(1);
          }
        }

        @keyframes particle2 {
          0% {
            opacity: 0;
            transform: translate(0, 10px) scale(.5);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-30px, -120px) scale(1);
          }
        }

        @keyframes particle3 {
          0% {
            opacity: 0;
            transform: translate(0, -10px) scale(.5);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(50px, 80px) scale(1);
          }
        }
      `}</style>
    </main>
  );
}

/* -------------------------------- */
/* X MARK                           */
/* -------------------------------- */

function XMark({ winning }: { winning: boolean }) {
  return (
    <span
      className={`relative block h-[48%] w-[48%] ${
        winning ? "animate-[winPulse_.8s_ease-in-out_infinite]" : ""
      }`}
    >
      <span
        className="absolute left-1/2 top-1/2 h-[9%] w-[82%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.12)] animate-[markIn_.32s_cubic-bezier(.2,.8,.2,1)]"
      />

      <span
        className="absolute left-1/2 top-1/2 h-[9%] w-[82%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,.12)] animate-[markIn_.32s_cubic-bezier(.2,.8,.2,1)_50ms]"
      />
    </span>
  );
}

/* -------------------------------- */
/* O MARK                           */
/* -------------------------------- */

function OMark({ winning }: { winning: boolean }) {
  return (
    <span
      className={`relative block aspect-square h-[48%] ${
        winning ? "animate-[winPulse_.8s_ease-in-out_infinite]" : ""
      }`}
    >
      <span className="absolute inset-0 rounded-full border-[7px] border-white/90 shadow-[0_0_18px_rgba(255,255,255,.10)] animate-[ringIn_.32s_cubic-bezier(.2,.8,.2,1)]" />

      <span className="absolute inset-[20%] rounded-full bg-white/[0.025]" />
    </span>
  );
}

/* -------------------------------- */
/* SCORE CARD                       */
/* -------------------------------- */

function ScoreCard({
  label,
  value,
  active,
}: {
  label: string;
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-[15px] border p-3 text-center transition-all duration-300 ${
        active
          ? "border-white/[0.14] bg-white/[0.07]"
          : "border-white/[0.045] bg-white/[0.02]"
      }`}
    >
      <p className="text-[9px] font-medium text-white/25">
        {label}
      </p>

      <p className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-white/80">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------- */
/* PLAYER BADGE                     */
/* -------------------------------- */

function PlayerBadge({
  player,
  active,
  score,
}: {
  player: Player;
  active: boolean;
  score: number;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-300 ${
        active
          ? "bg-white/[0.10] text-white"
          : "text-white/25"
      }`}
    >
      <span className="text-[12px] font-semibold">
        {player}
      </span>

      <span
        className={`h-1 w-1 rounded-full ${
          active ? "bg-white/60" : "bg-white/10"
        }`}
      />

      <span className="font-mono text-[9px]">
        {score}
      </span>
    </div>
  );
}

/* -------------------------------- */
/* INFO ROW                         */
/* -------------------------------- */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.04] pb-2.5 last:border-0 last:pb-0">
      <span className="text-[11px] text-white/25">
        {label}
      </span>

      <span className="font-mono text-[10px] text-white/50">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------- */
/* MOBILE STAT                      */
/* -------------------------------- */

function MobileStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-center backdrop-blur-xl">
      <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white/70">
        {value}
      </p>
    </div>
  );
}

export default App;