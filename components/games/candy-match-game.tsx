"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Candy types
type CandyType = "red" | "orange" | "yellow" | "green" | "blue" | "purple"

// Game constants
const GRID_SIZE = 8
const MIN_MATCH = 3
const CANDY_TYPES: CandyType[] = ["red", "orange", "yellow", "green", "blue", "purple"]
const CANDY_COLORS = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500"
}

// Game state
interface GameState {
  grid: CandyType[][]
  score: number
  moves: number
  maxMoves: number
  targetScore: number
  selectedCandy: { row: number; col: number } | null
  gameOver: boolean
  isSwapping: boolean
  isChecking: boolean
  animations: { row: number; col: number; type: "remove" | "add" }[]
}

export default function CandyMatchGame() {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    score: 0,
    moves: 0,
    maxMoves: 20,
    targetScore: 1000,
    selectedCandy: null,
    gameOver: false,
    isSwapping: false,
    isChecking: false,
    animations: []
  })

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  // Initialize the game
  const initializeGame = () => {
    // Create a grid with no initial matches
    let grid: CandyType[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => 
        CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
      )
    )

    // Remove any initial matches
    let hasMatches = true
    while (hasMatches) {
      const matches = findMatches(grid)
      if (matches.length === 0) {
        hasMatches = false
      } else {
        // Replace matched candies with new ones
        for (const match of matches) {
          for (const { row, col } of match) {
            grid[row][col] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
          }
        }
      }
    }

    setGameState({
      grid,
      score: 0,
      moves: 0,
      maxMoves: 20,
      targetScore: 1000,
      selectedCandy: null,
      gameOver: false,
      isSwapping: false,
      isChecking: false,
      animations: []
    })
  }

  // Find all matches in the grid
  const findMatches = (grid: CandyType[][]) => {
    const matches: { row: number; col: number }[][] = []

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      let matchLength = 1
      let currentType = grid[row][0]

      for (let col = 1; col < GRID_SIZE; col++) {
        if (grid[row][col] === currentType) {
          matchLength++
        } else {
          if (matchLength >= MIN_MATCH) {
            const match = []
            for (let i = col - matchLength; i < col; i++) {
              match.push({ row, col: i })
            }
            matches.push(match)
          }
          matchLength = 1
          currentType = grid[row][col]
        }
      }

      // Check for match at the end of row
      if (matchLength >= MIN_MATCH) {
        const match = []
        for (let i = GRID_SIZE - matchLength; i < GRID_SIZE; i++) {
          match.push({ row, col: i })
        }
        matches.push(match)
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      let matchLength = 1
      let currentType = grid[0][col]

      for (let row = 1; row < GRID_SIZE; row++) {
        if (grid[row][col] === currentType) {
          matchLength++
        } else {
          if (matchLength >= MIN_MATCH) {
            const match = []
            for (let i = row - matchLength; i < row; i++) {
              match.push({ row: i, col })
            }
            matches.push(match)
          }
          matchLength = 1
          currentType = grid[row][col]
        }
      }

      // Check for match at the end of column
      if (matchLength >= MIN_MATCH) {
        const match = []
        for (let i = GRID_SIZE - matchLength; i < GRID_SIZE; i++) {
          match.push({ row: i, col })
        }
        matches.push(match)
      }
    }

    return matches
  }

  // Handle candy selection
  const handleCandyClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.isSwapping || gameState.isChecking) return

    const { selectedCandy } = gameState

    if (!selectedCandy) {
      // First candy selection
      setGameState(prev => ({
        ...prev,
        selectedCandy: { row, col }
      }))
    } else {
      // Second candy selection - check if it's adjacent
      const isAdjacent = (
        (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
        (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row)
      )

      if (isAdjacent) {
        // Try to swap
        swapCandies(selectedCandy.row, selectedCandy.col, row, col)
      } else {
        // Not adjacent, select this candy instead
        setGameState(prev => ({
          ...prev,
          selectedCandy: { row, col }
        }))
      }
    }
  }

  // Swap two candies
  const swapCandies = async (row1: number, col1: number, row2: number, col2: number) => {
    setGameState(prev => ({
      ...prev,
      isSwapping: true,
      selectedCandy: null
    }))

    // Create a new grid with swapped candies
    const newGrid = [...gameState.grid.map(row => [...row])]
    const temp = newGrid[row1][col1]
    newGrid[row1][col1] = newGrid[row2][col2]
    newGrid[row2][col2] = temp

    // Check if the swap creates a match
    const matches = findMatches(newGrid)

    if (matches.length > 0) {
      // Valid move
      setGameState(prev => ({
        ...prev,
        grid: newGrid,
        moves: prev.moves + 1,
        isSwapping: false,
        isChecking: true
      }))

      // Process matches
      await processMatches(newGrid)
    } else {
      // Invalid move, swap back
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          isSwapping: false
        }))
      }, 500)
    }
  }

  // Process matches and update the grid
  const processMatches = async (grid: CandyType[][]) => {
    let currentGrid = [...grid.map(row => [...row])]
    let totalScore = gameState.score
    let keepChecking = true

    while (keepChecking) {
      const matches = findMatches(currentGrid)

      if (matches.length === 0) {
        keepChecking = false
      } else {
        // Add to score
        const matchCount = matches.reduce((sum, match) => sum + match.length, 0)
        totalScore += matchCount * 10

        // Mark candies for removal animation
        const animationsRemove = []
        for (const match of matches) {
          for (const { row, col } of match) {
            animationsRemove.push({ row, col, type: "remove" as const })
          }
        }

        setGameState(prev => ({
          ...prev,
          animations: animationsRemove,
          score: totalScore
        }))

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 300))

        // Remove matched candies (set to null temporarily)
        for (const match of matches) {
          for (const { row, col } of match) {
            currentGrid[row][col] = null as any
          }
        }

        // Drop candies down
        for (let col = 0; col < GRID_SIZE; col++) {
          let emptyRow = GRID_SIZE - 1

          // Find and move candies down
          for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (currentGrid[row][col] !== null) {
              if (row !== emptyRow) {
                currentGrid[emptyRow][col] = currentGrid[row][col]
                currentGrid[row][col] = null as any
              }
              emptyRow--
            }
          }

          // Fill empty spaces with new candies
          for (let row = emptyRow; row >= 0; row--) {
            currentGrid[row][col] = CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)]
          }
        }

        // Mark new candies for add animation
        const animationsAdd = []
        for (let col = 0; col < GRID_SIZE; col++) {
          for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[row][col] === null) {
              animationsAdd.push({ row, col, type: "add" as const })
            }
          }
        }

        setGameState(prev => ({
          ...prev,
          grid: currentGrid,
          animations: animationsAdd
        }))

        // Wait for animation
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    // Check if game is over
    const isGameOver = gameState.moves >= gameState.maxMoves - 1

    setGameState(prev => ({
      ...prev,
      score: totalScore,
      isChecking: false,
      gameOver: isGameOver,
      animations: []
    }))
  }

  // Render a candy
  const renderCandy = (type: CandyType, row: number, col: number) => {
    const { selectedCandy, animations } = gameState
    const isSelected = selectedCandy?.row === row && selectedCandy?.col === col
    const animation = animations.find(a => a.row === row && a.col === col)

    return (
      <div
        key={`${row}-${col}`}
        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
          ${CANDY_COLORS[type]}
          ${isSelected ? "ring-4 ring-white ring-opacity-70 animate-pulse-highlight" : ""}
          ${animation?.type === "remove" ? "animate-scale-out" : ""}
          ${animation?.type === "add" ? "animate-scale-in" : ""}`}
        onClick={() => handleCandyClick(row, col)}
      >
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-30"></div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Candy Match</CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="outline">Score: {gameState.score}</Badge>
          <Badge variant="outline">Moves: {gameState.moves}/{gameState.maxMoves}</Badge>
          <Button size="sm" onClick={initializeGame}>New Game</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Target: {gameState.targetScore}</span>
            <span className="text-sm">{Math.min(100, Math.floor(gameState.score / gameState.targetScore * 100))}%</span>
          </div>
          <Progress value={Math.min(100, Math.floor(gameState.score / gameState.targetScore * 100))} />
        </div>

        {gameState.gameOver ? (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">
              {gameState.score >= gameState.targetScore ? "🎉 You Won! 🎉" : "Game Over"}
            </h2>
            <p className="text-xl mb-6">
              Your score: {gameState.score} / {gameState.targetScore}
            </p>
            <Button onClick={initializeGame}>Play Again</Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-8 gap-1 bg-gray-200 p-2 rounded-lg">
              {gameState.grid.map((row, rowIndex) => (
                row.map((candy, colIndex) => (
                  renderCandy(candy, rowIndex, colIndex)
                ))
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-center text-muted-foreground">
          Match 3 or more candies of the same color. Reach the target score to win!
        </div>
      </CardContent>
    </Card>
  )
}
