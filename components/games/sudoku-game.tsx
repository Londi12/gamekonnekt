"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Simple Sudoku puzzle (0 represents empty cells)
const EASY_PUZZLE = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
]

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
]

export default function SudokuGame() {
  const [board, setBoard] = useState([])
  const [originalBoard, setOriginalBoard] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [won, setWon] = useState(false)
  const [errors, setErrors] = useState(0)

  const initializeGame = useCallback(() => {
    const newBoard = EASY_PUZZLE.map((row) => [...row])
    setBoard(newBoard)
    setOriginalBoard(EASY_PUZZLE.map((row) => [...row]))
    setSelectedCell(null)
    setWon(false)
    setErrors(0)
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const isValidMove = (board, row, col, num) => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (x !== col && board[row][x] === num) {
        return false
      }
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (x !== row && board[x][col] === num) {
        return false
      }
    }

    // Check 3x3 box
    const startRow = row - (row % 3)
    const startCol = col - (col % 3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const currentRow = startRow + i
        const currentCol = startCol + j
        if (currentRow !== row && currentCol !== col && board[currentRow][currentCol] === num) {
          return false
        }
      }
    }

    return true
  }

  const handleCellClick = (row, col) => {
    if (originalBoard[row][col] !== 0) return // Can't edit pre-filled cells
    setSelectedCell({ row, col })
  }

  const handleNumberInput = (num) => {
    if (!selectedCell) return

    const { row, col } = selectedCell
    if (originalBoard[row][col] !== 0) return

    const newBoard = board.map((r) => [...r])

    if (num === 0) {
      // Clear cell
      newBoard[row][col] = 0
    } else {
      // Check if move is valid
      if (isValidMove(newBoard, row, col, num)) {
        newBoard[row][col] = num
      } else {
        setErrors((prev) => prev + 1)
        return
      }
    }

    setBoard(newBoard)

    // Check for win
    const isComplete = newBoard.every((row, i) => row.every((cell, j) => cell === SOLUTION[i][j]))

    if (isComplete) {
      setWon(true)
    }
  }

  const getCellStyle = (row, col) => {
    const isSelected = selectedCell && selectedCell.row === row && selectedCell.col === col
    const isOriginal = originalBoard[row][col] !== 0
    const isInSameRow = selectedCell && selectedCell.row === row
    const isInSameCol = selectedCell && selectedCell.col === col
    const isInSameBox =
      selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3)

    let className =
      "w-10 h-10 border border-gray-400 flex items-center justify-center text-lg font-bold cursor-pointer transition-colors "

    if (isSelected) {
      className += "bg-blue-200 border-blue-500 "
    } else if (isInSameRow || isInSameCol || isInSameBox) {
      className += "bg-blue-50 "
    } else {
      className += "bg-white hover:bg-gray-50 "
    }

    if (isOriginal) {
      className += "text-black font-extrabold "
    } else {
      className += "text-blue-600 "
    }

    // Thick borders for 3x3 boxes
    if (row % 3 === 0) className += "border-t-2 border-t-black "
    if (col % 3 === 0) className += "border-l-2 border-l-black "
    if (row === 8) className += "border-b-2 border-b-black "
    if (col === 8) className += "border-r-2 border-r-black "

    return className
  }

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Sudoku</CardTitle>
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-4">
            <Badge variant="outline">Errors: {errors}</Badge>
            <Badge variant={won ? "default" : "outline"}>{won ? "🎉 Complete!" : "In Progress"}</Badge>
          </div>
          {won && <div className="text-green-500 font-bold text-xl">Congratulations! You solved it!</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sudoku Grid */}
        <div className="grid grid-cols-9 gap-0 border-2 border-black bg-white">
          {board.map((row, i) =>
            row.map((cell, j) => (
              <button
                key={`${i}-${j}`}
                className={getCellStyle(i, j)}
                onClick={() => handleCellClick(i, j)}
                disabled={won}
              >
                {cell !== 0 ? cell : ""}
              </button>
            )),
          )}
        </div>

        {/* Number Input Buttons */}
        <div className="space-y-4">
          <div className="text-center text-sm font-medium">
            {selectedCell
              ? `Selected: Row ${selectedCell.row + 1}, Col ${selectedCell.col + 1}`
              : "Select a cell to enter numbers"}
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                onClick={() => handleNumberInput(num)}
                disabled={!selectedCell || won}
                className="h-12 text-lg font-bold"
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handleNumberInput(0)}
              disabled={!selectedCell || won}
              className="h-12 text-lg font-bold"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center space-y-2">
          <Button onClick={initializeGame} className="w-full">
            New Game
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Fill each row, column, and 3×3 box with digits 1-9</p>
            <p>Click a cell, then click a number to fill it</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
