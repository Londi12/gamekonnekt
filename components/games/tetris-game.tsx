"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Trophy, RotateCcw, Play, Pause, Save } from "lucide-react"
import { useGameState } from "@/hooks/use-game-state"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-300 shadow-cyan-500/30",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/30",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-purple-500/30",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/30",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-red-500/30",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-blue-500/30",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-orange-500/30",
  },
}

export default function TetrisGame() {
  // Use the game state hook for persistence
  const {
    state,
    highScore,
    saveState,
    updateHighScore,
    resetState
  } = useGameState("tetris", {
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)),
    score: 0,
    level: 1,
    lines: 0
  })

  const [board, setBoard] = useState(() =>
    state?.board || Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(0)),
  )
  const [currentPiece, setCurrentPiece] = useState(null)
  const [score, setScore] = useState(state?.score || 0)
  const [level, setLevel] = useState(state?.level || 1)
  const [lines, setLines] = useState(state?.lines || 0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [nextPiece, setNextPiece] = useState(null)

  const createNewPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOES)
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
    return {
      type: randomPiece,
      shape: TETROMINOES[randomPiece].shape,
      color: TETROMINOES[randomPiece].color,
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
    }
  }, [])

  const isValidMove = useCallback(
    (piece, newX, newY, newShape = piece.shape) => {
      for (let y = 0; y < newShape.length; y++) {
        for (let x = 0; x < newShape[y].length; x++) {
          if (newShape[y][x]) {
            const boardX = newX + x
            const boardY = newY + y

            if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
              return false
            }

            if (boardY >= 0 && board[boardY][boardX]) {
              return false
            }
          }
        }
      }
      return true
    },
    [board],
  )

  const placePiece = useCallback(() => {
    if (!currentPiece) return

    const newBoard = board.map((row) => [...row])

    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          const boardY = currentPiece.y + y
          const boardX = currentPiece.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.type
          }
        }
      }
    }

    // Clear completed lines
    let linesCleared = 0
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every((cell) => cell !== 0)) {
        newBoard.splice(y, 1)
        newBoard.unshift(Array(BOARD_WIDTH).fill(0))
        linesCleared++
        y++ // Check the same line again
      }
    }

    setBoard(newBoard)

    // Update score and level
    const linePoints = [0, 40, 100, 300, 1200] // Points for 0, 1, 2, 3, 4 lines
    const newScore = score + linePoints[linesCleared] * level
    setScore(newScore)

    // Update high score using the hook
    updateHighScore(newScore)

    // Save game state
    saveState({
      board: newBoard,
      score: newScore,
      level: Math.floor((lines + linesCleared) / 10) + 1,
      lines: lines + linesCleared
    })

    const newLines = lines + linesCleared
    setLines(newLines)

    // Level up every 10 lines
    const newLevel = Math.floor(newLines / 10) + 1
    setLevel(newLevel)

    // Set next piece as current and generate new next piece
    setCurrentPiece(nextPiece)
    setNextPiece(createNewPiece())

    // Check if game over
    if (!isValidMove(nextPiece, nextPiece.x, nextPiece.y)) {
      setGameOver(true)
      setIsPlaying(false)
    }
  }, [board, currentPiece, nextPiece, createNewPiece, isValidMove, score, level, lines, highScore])

  const movePiece = useCallback(
    (dx, dy) => {
      if (!currentPiece || gameOver || isPaused) return

      const newX = currentPiece.x + dx
      const newY = currentPiece.y + dy

      if (isValidMove(currentPiece, newX, newY)) {
        setCurrentPiece((prev) => ({ ...prev, x: newX, y: newY }))
      } else if (dy > 0) {
        placePiece()
      }
    },
    [currentPiece, gameOver, isPaused, isValidMove, placePiece],
  )

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse())

    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotated }))
    } else {
      // Try wall kicks - attempt to shift the piece if rotation is blocked
      const kicks = [1, -1, 2, -2] // Try right, left, 2 right, 2 left
      for (const kick of kicks) {
        if (isValidMove(currentPiece, currentPiece.x + kick, currentPiece.y, rotated)) {
          setCurrentPiece((prev) => ({ ...prev, shape: rotated, x: prev.x + kick }))
          return
        }
      }
    }
  }, [currentPiece, gameOver, isPaused, isValidMove])

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let newY = currentPiece.y
    while (isValidMove(currentPiece, currentPiece.x, newY + 1)) {
      newY++
    }

    setCurrentPiece((prev) => ({ ...prev, y: newY }))
    placePiece()
  }, [currentPiece, gameOver, isPaused, isValidMove, placePiece])

  const startGame = () => {
    // Reset the game state using the hook
    resetState()

    setBoard(
      Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(0)),
    )
    const firstPiece = createNewPiece()
    const secondPiece = createNewPiece()
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) return

    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          movePiece(-1, 0)
          break
        case "ArrowRight":
          e.preventDefault()
          movePiece(1, 0)
          break
        case "ArrowDown":
          e.preventDefault()
          movePiece(0, 1)
          break
        case "ArrowUp":
          e.preventDefault()
          rotatePiece()
          break
        case " ": // Space bar
          e.preventDefault()
          hardDrop()
          break
        case "p":
        case "P":
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, movePiece, rotatePiece, hardDrop, gameOver, isPaused])

  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) return

    const speed = Math.max(100, 800 - (level - 1) * 70) // Speed increases with level
    const interval = setInterval(() => {
      movePiece(0, 1)
    }, speed)

    return () => clearInterval(interval)
  }, [isPlaying, movePiece, level, gameOver, isPaused])

  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y
            const boardX = currentPiece.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.type
            }
          }
        }
      }
    }

    // Calculate ghost piece position (preview of where piece will land)
    let ghostY = currentPiece?.y
    if (currentPiece && !isPaused) {
      while (ghostY < BOARD_HEIGHT && isValidMove(currentPiece, currentPiece.x, ghostY + 1)) {
        ghostY++
      }

      // Only show ghost if it's different from current position
      if (ghostY !== currentPiece.y) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
          for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
              const boardY = ghostY + y
              const boardX = currentPiece.x + x
              if (
                boardY >= 0 &&
                boardY < BOARD_HEIGHT &&
                boardX >= 0 &&
                boardX < BOARD_WIDTH &&
                displayBoard[boardY][boardX] === 0
              ) {
                displayBoard[boardY][boardX] = "ghost"
              }
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => {
          const isGhost = cell === "ghost"
          return (
            <motion.div
              key={x}
              initial={{ scale: isGhost ? 1 : 0.8, opacity: isGhost ? 0.5 : 0 }}
              animate={{
                scale: 1,
                opacity: isGhost ? 0.3 : 1,
              }}
              transition={{ duration: 0.1 }}
              className={`w-6 h-6 border ${
                isGhost
                  ? `border-dashed border-gray-400 bg-transparent`
                  : cell
                    ? `${TETROMINOES[cell]?.color} border shadow-lg`
                    : "bg-gray-800/20 border-gray-700/30"
              }`}
            />
          )
        })}
      </div>
    ))
  }

  const renderNextPiece = () => {
    if (!nextPiece) return null

    const shape = nextPiece.shape
    const width = shape[0].length
    const height = shape.length

    const grid = []
    for (let y = 0; y < 4; y++) {
      const row = []
      for (let x = 0; x < 4; x++) {
        const isFilled = y < height && x < width && shape[y][x] === 1

        row.push(
          <div
            key={`next-${y}-${x}`}
            className={`w-4 h-4 ${isFilled ? TETROMINOES[nextPiece.type].color : "bg-transparent"}`}
          />,
        )
      }
      grid.push(
        <div key={`next-row-${y}`} className="flex">
          {row}
        </div>,
      )
    }

    return (
      <div className="flex flex-col items-center">
        <div className="mb-1 text-sm font-semibold text-gray-400">NEXT</div>
        <div className="p-2 bg-gray-800/40 rounded-md">{grid}</div>
      </div>
    )
  }

  return (
    <Card className="w-fit mx-auto overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800">
      <CardHeader className="pb-2 border-b border-gray-700">
        <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          TETRIS
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Stats Panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-gray-800/60 rounded-lg p-3 space-y-3 min-w-[120px]">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400">SCORE</div>
                <div className="text-xl font-bold text-white">{score}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400">HIGH SCORE</div>
                <div className="text-lg font-bold text-amber-400">{highScore}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400">LEVEL</div>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  {level}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400">LINES</div>
                <div className="text-lg font-mono">{lines}</div>
              </div>

              {renderNextPiece()}
            </div>

            <div className="space-y-2">
              <Button
                onClick={isPlaying ? togglePause : startGame}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
              >
                {isPlaying ? (
                  isPaused ? (
                    <Play className="mr-1 h-4 w-4" />
                  ) : (
                    <Pause className="mr-1 h-4 w-4" />
                  )
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                {isPlaying ? (isPaused ? "Resume" : "Pause") : "Start Game"}
              </Button>

              {isPlaying && (
                <>
                  <Button
                    onClick={() => {
                      saveState({
                        board,
                        score,
                        level,
                        lines
                      });
                    }}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                    disabled={gameOver}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save Game
                  </Button>
                  <Button
                    onClick={startGame}
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    Restart
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Game Board */}
          <div className="relative">
            <div className="border-2 border-gray-700 p-1 bg-gradient-to-b from-gray-900 to-gray-800 rounded-md shadow-inner">
              {renderBoard()}
            </div>

            {/* Overlay Messages */}
            <AnimatePresence>
              {(gameOver || isPaused) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                >
                  {gameOver ? (
                    <div className="text-center space-y-2">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-bold text-red-500"
                      >
                        GAME OVER
                      </motion.div>
                      {score > 0 && (
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className="h-5 w-5 text-yellow-500" />
                          <span className="text-lg text-yellow-400">Score: {score}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-white">PAUSED</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400 space-y-1">
            <div>← → : Move | ↑ : Rotate | ↓ : Soft Drop</div>
            <div>SPACE : Hard Drop | P : Pause</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
