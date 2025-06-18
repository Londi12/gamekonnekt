"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GRID_SIZE = 4

export default function Game2048() {
  const [board, setBoard] = useState(() =>
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0)),
  )
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)

  const addRandomTile = useCallback((currentBoard) => {
    const emptyCells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (currentBoard[i][j] === 0) {
          emptyCells.push([i, j])
        }
      }
    }

    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
      const newBoard = currentBoard.map((row) => [...row])
      newBoard[row][col] = Math.random() < 0.9 ? 2 : 4
      return newBoard
    }
    return currentBoard
  }, [])

  const initializeGame = useCallback(() => {
    let newBoard = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(0))
    newBoard = addRandomTile(newBoard)
    newBoard = addRandomTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setGameOver(false)
    setWon(false)
  }, [addRandomTile])

  const moveLeft = (board) => {
    const newBoard = board.map((row) => [...row])
    let moved = false
    let newScore = 0

    for (let i = 0; i < GRID_SIZE; i++) {
      const row = newBoard[i].filter((val) => val !== 0)

      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2
          newScore += row[j]
          if (row[j] === 2048) setWon(true)
          row[j + 1] = 0
        }
      }

      const filteredRow = row.filter((val) => val !== 0)
      while (filteredRow.length < GRID_SIZE) {
        filteredRow.push(0)
      }

      for (let j = 0; j < GRID_SIZE; j++) {
        if (newBoard[i][j] !== filteredRow[j]) {
          moved = true
        }
        newBoard[i][j] = filteredRow[j]
      }
    }

    return { board: newBoard, moved, score: newScore }
  }

  const rotateBoard = (board) => {
    return board[0].map((_, i) => board.map((row) => row[i]).reverse())
  }

  const move = useCallback(
    (direction) => {
      if (gameOver) return

      let currentBoard = board.map((row) => [...row])
      let result

      switch (direction) {
        case "left":
          result = moveLeft(currentBoard)
          break
        case "right":
          currentBoard = rotateBoard(rotateBoard(currentBoard))
          result = moveLeft(currentBoard)
          result.board = rotateBoard(rotateBoard(result.board))
          break
        case "up":
          currentBoard = rotateBoard(rotateBoard(rotateBoard(currentBoard)))
          result = moveLeft(currentBoard)
          result.board = rotateBoard(result.board)
          break
        case "down":
          currentBoard = rotateBoard(currentBoard)
          result = moveLeft(currentBoard)
          result.board = rotateBoard(rotateBoard(rotateBoard(result.board)))
          break
        default:
          return
      }

      if (result.moved) {
        const newBoard = addRandomTile(result.board)
        setBoard(newBoard)
        setScore((prev) => prev + result.score)

        // Check for game over
        if (!canMove(newBoard)) {
          setGameOver(true)
        }
      }
    },
    [board, gameOver, addRandomTile],
  )

  const canMove = (board) => {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (board[i][j] === 0) return true
      }
    }

    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = board[i][j]
        if ((i < GRID_SIZE - 1 && board[i + 1][j] === current) || (j < GRID_SIZE - 1 && board[i][j + 1] === current)) {
          return true
        }
      }
    }

    return false
  }

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          move("left")
          break
        case "ArrowRight":
          e.preventDefault()
          move("right")
          break
        case "ArrowUp":
          e.preventDefault()
          move("up")
          break
        case "ArrowDown":
          e.preventDefault()
          move("down")
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [move])

  const getTileColor = (value) => {
    const colors = {
      2: "bg-gray-100 text-gray-800",
      4: "bg-gray-200 text-gray-800",
      8: "bg-orange-200 text-white",
      16: "bg-orange-300 text-white",
      32: "bg-orange-400 text-white",
      64: "bg-orange-500 text-white",
      128: "bg-yellow-300 text-white",
      256: "bg-yellow-400 text-white",
      512: "bg-yellow-500 text-white",
      1024: "bg-yellow-600 text-white",
      2048: "bg-yellow-700 text-white",
    }
    return colors[value] || "bg-yellow-800 text-white"
  }

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">2048</CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold">Score: {score}</div>
          {won && <div className="text-green-500 font-bold">You Won!</div>}
          {gameOver && <div className="text-red-500 font-bold">Game Over!</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-300 rounded-lg">
          {board.flat().map((value, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded flex items-center justify-center font-bold text-lg ${
                value === 0 ? "bg-gray-200" : getTileColor(value)
              }`}
            >
              {value !== 0 && value}
            </div>
          ))}
        </div>

        <div className="text-center space-y-2">
          <Button onClick={initializeGame} className="w-full">
            New Game
          </Button>

          <div className="text-sm text-muted-foreground">
            Use arrow keys to move tiles. Combine tiles with the same number to reach 2048!
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
