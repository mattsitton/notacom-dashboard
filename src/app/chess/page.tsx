"use client";

import { useState } from "react";
import { Gamepad2, RotateCcw, AlertTriangle } from "lucide-react";
import { Chess, Square } from "chess.js";

const pieceMap: Record<string, Record<string, string>> = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }
};

export default function ChessPage() {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  const toAlgebraic = (row: number, col: number): Square => {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return `${file}${rank}` as Square;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (game.isGameOver()) return;

    const square = toAlgebraic(row, col);
    const pieceOnSquare = game.get(square);

    if (!selectedSquare) {
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
      setSelectedSquare(square);
      return;
    }

    try {
      const gameCopy = new Chess(game.fen());
      
      const move = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: "q",
      });

      if (move) {
        game.move(move);
        setFen(game.fen());
        setSelectedSquare(null);
      }
    } catch (e) {
      setSelectedSquare(null);
    }
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
  };

  const board = game.board();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-[#87FFC5]" />
          Two-Player Chess
        </h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Game
        </button>
      </div>

      {/* Game Over / Status Indicator */}
      <div className={`border rounded-xl p-4 flex items-center justify-between ${
        game.isCheckmate() ? "bg-red-950/50 border-red-900" : 
        game.isDraw() ? "bg-yellow-950/50 border-yellow-900" : 
        "bg-zinc-900 border-zinc-800"
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-400">Status:</span>
          {game.isCheckmate() ? (
            <span className="text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Checkmate! {game.turn() === "w" ? "Black" : "White"} wins.
            </span>
          ) : game.isDraw() ? (
            <span className="text-sm font-bold text-yellow-400">Draw!</span>
          ) : (
            <span className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-md ${
              game.turn() === "w" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-zinc-100 border border-zinc-700"
            }`}>
              {game.turn() === "w" ? "White" : "Black"}'s Turn
            </span>
          )}
        </div>
        
        {game.inCheck() && !game.isCheckmate() && (
           <span className="text-xs font-bold text-red-400 animate-pulse uppercase tracking-widest">
             Check
           </span>
        )}
      </div>

      {/* Board Viewport */}
      <div className="flex justify-center">
        {/* FIX: Added grid-rows-8 to force exactly 8 equal rows */}
        <div className="grid grid-cols-8 grid-rows-8 gap-0 border-4 border-zinc-800 rounded-lg overflow-hidden shadow-2xl w-full max-w-[560px] aspect-square bg-zinc-800">
          {board.map((row, rIdx) =>
            row.map((pieceObj, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              const squareAlgebraic = toAlgebraic(rIdx, cIdx);
              const isSelected = selectedSquare === squareAlgebraic;
              const isKingInCheck = pieceObj?.type === 'k' && pieceObj.color === game.turn() && game.inCheck();

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleSquareClick(rIdx, cIdx)}
                  // FIX: Added w-full h-full so empty buttons don't collapse
                  className={`w-full h-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl select-none transition-colors duration-150 ${
                    isSelected
                      ? "bg-amber-500/60"
                      : isKingInCheck
                      ? "bg-red-500/50"
                      : isDark
                      ? "bg-zinc-800 hover:bg-zinc-700"
                      : "bg-zinc-600 hover:bg-zinc-500"
                  }`}
                >
                  <span className={`drop-shadow-md ${pieceObj?.color === 'w' ? 'text-white' : 'text-zinc-950'}`}>
                    {pieceObj ? pieceMap[pieceObj.color][pieceObj.type] : ""}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
