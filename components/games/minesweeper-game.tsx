"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Trophy } from "lucide-react"
import { motion } from "framer-motion"

const DIFFICULTY = {
  BEGINNER: { name: "Beginner", gridSize: 9, mineCount: 10 },
  INTERMEDIATE: { name: "Intermediate", gridSize: 16, mineCount: 40 },
  EXPERT: { name: "Expert", gridSize: 22, mineCount: 99 },
}

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState(DIFFICULTY.BEGINNER)
  const [board, setBoard] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [flagCount, setFlagCount] = useState(0)
  const [firstClick, setFirstClick] = useState(true)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [faceStatus, setFaceStatus] = useState("smile") // smile, wow, dead, cool
  const [cellSize, setCellSize] = useState(32)

  const initializeBoard = useCallback(() => {
    const newBoard = []
    for (let i = 0; i < difficulty.gridSize; i++) {
      const row = []
      for (let j = 0; j < difficulty.gridSize; j++) {
        row.push({
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborCount: 0,
        })
      }
      newBoard.push(row)
    }
    return newBoard
  }, [difficulty])

  const placeMines = useCallback(
    (board, excludeRow, excludeCol) => {
      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
      let minesPlaced = 0

      while (minesPlaced < difficulty.mineCount) {
        const row = Math.floor(Math.random() * difficulty.gridSize)
        const col = Math.floor(Math.random() * difficulty.gridSize)

        // Avoid placing mines in a 3x3 area around the first click
        const isNearFirstClick = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1

        if (!newBoard[row][col].isMine && !isNearFirstClick) {
          newBoard[row][col].isMine = true
          minesPlaced++
        }
      }

      // Calculate neighbor counts
      for (let i = 0; i < difficulty.gridSize; i++) {
        for (let j = 0; j < difficulty.gridSize; j++) {
          if (!newBoard[i][j].isMine) {
            let count = 0
            for (let di = -1; di <= 1; di++) {
              for (let dj = -1; dj <= 1; dj++) {
                const ni = i + di
                const nj = j + dj
                if (
                  ni >= 0 &&
                  ni < difficulty.gridSize &&
                  nj >= 0 &&
                  nj < difficulty.gridSize &&
                  newBoard[ni][nj].isMine
                ) {
                  count++
                }
              }
            }
            newBoard[i][j].neighborCount = count
          }
        }
      }

      return newBoard
    },
    [difficulty],
  )

  const startGame = useCallback(() => {
    // Adjust cell size based on difficulty
    if (difficulty.gridSize <= 9) {
      setCellSize(32)
    } else if (difficulty.gridSize <= 16) {
      setCellSize(24)
    } else {
      setCellSize(20)
    }

    const newBoard = initializeBoard()
    setBoard(newBoard)
    setGameOver(false)
    setWon(false)
    setFlagCount(0)
    setFirstClick(true)
    setTime(0)
    setIsPlaying(false)
    setFaceStatus("smile")
  }, [initializeBoard, difficulty])

  useEffect(() => {
    startGame()
  }, [startGame, difficulty])

  useEffect(() => {
    let timer
    if (isPlaying && !gameOver) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isPlaying, gameOver])

  const revealCell = useCallback(
    (row, col) => {
      if (gameOver || board[row][col].isRevealed || board[row][col].isFlagged) return

      setFaceStatus("wow")
      setTimeout(() => {
        if (!gameOver) setFaceStatus("smile")
      }, 500)

      let newBoard = board.map((row) => row.map((cell) => ({ ...cell })))

      if (firstClick) {
        newBoard = placeMines(newBoard, row, col)
        setFirstClick(false)
        setIsPlaying(true)
      }

      if (newBoard[row][col].isMine) {
        // Game over - reveal all mines
        for (let i = 0; i < difficulty.gridSize; i++) {
          for (let j = 0; j < difficulty.gridSize; j++) {
            if (newBoard[i][j].isMine) {
              newBoard[i][j].isRevealed = true
            }
          }
        }
        newBoard[row][col].isExploded = true // Mark the exploded mine
        setGameOver(true)
        setIsPlaying(false)
        setFaceStatus("dead")
        setBoard(newBoard)
        return
      }

      // Flood fill for empty cells
      const queue = [[row, col]]
      const visited = new Set()

      while (queue.length > 0) {
        const [r, c] = queue.shift()
        const key = `${r}-${c}`

        if (visited.has(key)) continue
        visited.add(key)

        if (
          r < 0 ||
          r >= difficulty.gridSize ||
          c < 0 ||
          c >= difficulty.gridSize ||
          newBoard[r][c].isRevealed ||
          newBoard[r][c].isMine
        ) {
          continue
        }

        newBoard[r][c].isRevealed = true
        if (newBoard[r][c].isFlagged) {
          newBoard[r][c].isFlagged = false
          setFlagCount((prev) => prev - 1)
        }

        if (newBoard[r][c].neighborCount === 0) {
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              queue.push([r + di, c + dj])
            }
          }
        }
      }

      setBoard(newBoard)

      // Check for win
      let revealedCount = 0
      let correctFlags = 0
      for (let i = 0; i < difficulty.gridSize; i++) {
        for (let j = 0; j < difficulty.gridSize; j++) {
          if (newBoard[i][j].isRevealed && !newBoard[i][j].isMine) {
            revealedCount++
          }
          if (newBoard[i][j].isFlagged && newBoard[i][j].isMine) {
            correctFlags++
          }
        }
      }

      const totalNonMines = difficulty.gridSize * difficulty.gridSize - difficulty.mineCount
      if (revealedCount === totalNonMines || correctFlags === difficulty.mineCount) {
        setWon(true)
        setGameOver(true)
        setIsPlaying(false)
        setFaceStatus("cool")

        // Flag all unflagged mines
        const finalBoard = newBoard.map((row) =>
          row.map((cell) => {
            if (cell.isMine && !cell.isFlagged) {
              return { ...cell, isFlagged: true }
            }
            return cell
          }),
        )
        setBoard(finalBoard)
        setFlagCount(difficulty.mineCount)
      }
    },
    [board, gameOver, firstClick, placeMines, difficulty],
  )

  const toggleFlag = useCallback(
    (e, row, col) => {
      e.preventDefault()
      if (gameOver || board[row][col].isRevealed || firstClick) return

      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))

      if (newBoard[row][col].isFlagged) {
        newBoard[row][col].isFlagged = false
        setFlagCount((prev) => prev - 1)
      } else if (flagCount < difficulty.mineCount) {
        newBoard[row][col].isFlagged = true
        setFlagCount((prev) => prev + 1)
      }

      setBoard(newBoard)
    },
    [board, gameOver, firstClick, flagCount, difficulty.mineCount],
  )

  const getCellContent = (cell) => {
    if (cell.isFlagged) return "🚩"
    if (!cell.isRevealed) return ""
    if (cell.isMine) {
      return cell.isExploded ? "💥" : "💣"
    }
    if (cell.neighborCount === 0) return ""
    return cell.neighborCount
  }

  const getCellStyle = (cell) => {
    const baseSize = `w-${cellSize === 32 ? "8" : cellSize === 24 ? "6" : "5"} h-${cellSize === 32 ? "8" : cellSize === 24 ? "6" : "5"}`

    if (cell.isFlagged) {
      return `${baseSize} bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-yellow-600 shadow-md hover:shadow-lg transition-all duration-200`
    }

    if (!cell.isRevealed) {
      return `${baseSize} bg-gradient-to-br from-gray-300 to-gray-400 hover:from-gray-200 hover:to-gray-300 border-2 border-gray-500 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer`
    }

    if (cell.isMine) {
      if (cell.isExploded) {
        return `${baseSize} bg-gradient-to-br from-red-500 to-red-700 border-2 border-red-800 shadow-lg`
      }
      return `${baseSize} bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-700 shadow-md`
    }

    const numberColors = {
      1: "text-blue-600 font-bold",
      2: "text-green-600 font-bold",
      3: "text-red-600 font-bold",
      4: "text-purple-600 font-bold",
      5: "text-yellow-600 font-bold",
      6: "text-pink-600 font-bold",
      7: "text-black font-bold",
      8: "text-gray-600 font-bold",
    }

    return `${baseSize} bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 shadow-inner ${numberColors[cell.neighborCount] || ""}`
  }

  const getFaceEmoji = () => {
    switch (faceStatus) {
      case "wow":
        return "😮"
      case "dead":
        return "😵"
      case "cool":
        return "😎"
      default:
        return "🙂"
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-fit mx-auto overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900">
      <CardHeader className="pb-3 bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600">
        <CardTitle className="text-center text-2xl font-bold text-white">💣 MINESWEEPER</CardTitle>

        {/* Difficulty Selection */}
        <div className="flex justify-center gap-2 mt-3">
          {Object.values(DIFFICULTY).map((diff) => (
            <Button
              key={diff.name}
              variant={difficulty.name === diff.name ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(diff)}
              className={
                difficulty.name === diff.name
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "border-gray-500 text-gray-300 hover:bg-gray-700"
              }
            >
              {diff.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-gradient-to-b from-gray-100 to-gray-200">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-4 bg-black/80 rounded-lg p-3 text-green-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-red-400">💣</span>
            <span className="text-xl font-bold">{(difficulty.mineCount - flagCount).toString().padStart(3, "0")}</span>
          </div>

          <button onClick={startGame} className="text-4xl hover:scale-110 transition-transform duration-200">
            {getFaceEmoji()}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-blue-400">⏱️</span>
            <span className="text-xl font-bold">{formatTime(time)}</span>
          </div>
        </div>

        {/* Game Board */}
        <div
          className="grid gap-1 p-4 bg-gray-300 rounded-lg shadow-inner border-4 border-gray-400"
          style={{
            gridTemplateColumns: `repeat(${difficulty.gridSize}, minmax(0, 1fr))`,
            maxWidth: difficulty.gridSize <= 9 ? "320px" : difficulty.gridSize <= 16 ? "400px" : "480px",
          }}
        >
          {board.map((row, i) =>
            row.map((cell, j) => (
              <motion.button
                key={`${i}-${j}`}
                whileHover={{ scale: cell.isRevealed ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`${getCellStyle(cell)} flex items-center justify-center text-sm font-bold transition-all duration-200`}
                onClick={() => revealCell(i, j)}
                onContextMenu={(e) => toggleFlag(e, i, j)}
                disabled={gameOver && !won}
                style={{ fontSize: cellSize === 32 ? "14px" : cellSize === 24 ? "12px" : "10px" }}
              >
                {getCellContent(cell)}
              </motion.button>
            )),
          )}
        </div>

        {/* Game Status */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white p-4 rounded-lg shadow-lg text-center space-y-3"
          >
            {won ? (
              <div className="space-y-2">
                <div className="text-green-600 font-bold text-xl flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Congratulations! 🎉
                </div>
                <div className="text-lg">
                  Time: <span className="font-bold text-blue-600">{formatTime(time)}</span>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  {difficulty.name} - All mines found!
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-600 font-bold text-xl">💥 Game Over!</div>
                <div className="text-gray-600">Better luck next time!</div>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-4 space-y-2">
          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            New Game
          </Button>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Left click to reveal • Right click to flag</p>
            <p>Find all mines without clicking on them!</p>
            <p className="font-medium">
              {difficulty.name}: {difficulty.gridSize}×{difficulty.gridSize} grid, {difficulty.mineCount} mines
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
