"use client";

import { useState, useEffect } from "react";
import { Gamepad2, RotateCcw, AlertTriangle } from "lucide-react";
import { Chess, Square } from "chess.js";

// Map chess.js piece objects to our cool Unicode characters
const pieceMap: Record<string, Record<string, string>> = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" }
};

export default function ChessPage() {
  // The 'brain' holds all the rules, history, and logic
  const [game, setGame] = useState(new Chess());
  // We track the FEN (a string representing the board state) to trigger React re-renders
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Convert row (0-7) and col (0-7) to algebraic notation (e.g., 'e2')
  const toAlgebraic = (row: number, col: number): Square => {
    const file = String.fromCharCode(97 + col);
    const rank = 8 - row;
    return `${file}${rank}` as Square;
  };

  const handleSquareClick = (row: number, col: number) => {
    if (game.isGameOver()) return;

    const square = toAlgebraic(row, col);
    const pieceOnSquare = game.get(square);

    // 1. If no square is selected, try to select one of your own pieces
    if (!selectedSquare) {
      if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    // 2. If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      return;
    }

    // 3. If clicking another of your own pieces, switch selection
    if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
      setSelectedSquare(square);
      return;
    }

    // 4. Try to move!
    try {
      // Clone the game to keep state pure
      const gameCopy = new Chess(game.fen());
      
      const move = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: "q", // Always promote to queen for simplicity right now
      });

      // If valid, update the real game state
      if (move) {
        game.move(move);
        setFen(game.fen());
        setSelectedSquare(null);
      }
    } catch (e) {
      // Invalid move (chess.js throws an error on illegal moves)
      setSelectedSquare(null);
    }
  };

  const handleReset = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setSelectedSquare(null);
  };

  // Derive the 2D array board from the current game state
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
        
        {/* Helper to show check state */}
        {game.inCheck() && !game.isCheckmate() && (
           <span className="text-xs font-bold text-red-400 animate-pulse uppercase tracking-widest">
             Check
           </span>
        )}
      </div>

      {/* Board Viewport */}
      <div className="flex justify-center">
        <div className="grid grid-cols-8 gap-0 border-4 border-zinc-800 rounded-lg overflow-hidden shadow-2xl w-full max-w-[560px] aspect-square">
          {board.map((row, rIdx) =>
            row.map((pieceObj, cIdx) => {
              const isDark = (rIdx + cIdx) % 2 === 1;
              const squareAlgebraic = toAlgebraic(rIdx, cIdx);
              const isSelected = selectedSquare === squareAlgebraic;
              
              // Highlight the king in red if in check
              const isKingInCheck = pieceObj?.type === 'k' && pieceObj.color === game.turn() && game.inCheck();

              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleSquareClick(rIdx, cIdx)}
                  className={`flex items-center justify-center text-4xl select-none transition-colors duration-150 ${
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
