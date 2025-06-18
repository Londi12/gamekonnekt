"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Trophy, Zap } from "lucide-react"

const BOARD_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }

const DIFFICULTY = {
  EASY: { name: "Easy", speed: 200, multiplier: 1 },
  MEDIUM: { name: "Medium", speed: 150, multiplier: 1.5 },
  HARD: { name: "Hard", speed: 100, multiplier: 2 },
  INSANE: { name: "Insane", speed: 80, multiplier: 3 },
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [direction, setDirection] = useState({ x: 0, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [difficulty, setDifficulty] = useState(DIFFICULTY.MEDIUM)
  const [foodType, setFoodType] = useState("apple")
  const [streak, setStreak] = useState(0)
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)

  const foodTypes = ["🍎", "🍊", "🍌", "🍇", "🍓", "🥝", "🍑", "🍒"]

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      }
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))

    // Random food type for variety
    setFoodType(foodTypes[Math.floor(Math.random() * foodTypes.length)])
    return newFood
  }, [snake])

  const startGame = () => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection({ x: 1, y: 0 })
    setGameOver(false)
    setScore(0)
    setStreak(0)
    setIsPlaying(true)
    setIsPaused(false)
    setFoodType("🍎")
  }

  const togglePause = () => {
    if (isPlaying && !gameOver) {
      setIsPaused(!isPaused)
    }
  }

  const moveSnake = useCallback(() => {
    if (!isPlaying || gameOver || isPaused) return

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake]
      const head = { ...newSnake[0] }

      head.x += direction.x
      head.y += direction.y

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true)
        setIsPlaying(false)
        if (score > highScore) {
          setHighScore(score)
        }
        return currentSnake
      }

      // Check self collision
      if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true)
        setIsPlaying(false)
        if (score > highScore) {
          setHighScore(score)
        }
        return currentSnake
      }

      newSnake.unshift(head)

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const points = Math.floor(10 * difficulty.multiplier)
        setScore((prev) => prev + points)
        setStreak((prev) => prev + 1)
        setFood(generateFood())
        setShowScoreAnimation(true)
        setTimeout(() => setShowScoreAnimation(false), 500)
      } else {
        newSnake.pop()
      }

      return newSnake
    })
  }, [direction, food, gameOver, isPlaying, isPaused, generateFood, difficulty, score, highScore])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault()
          setDirection((prev) => (prev.y !== 1 ? { x: 0, y: -1 } : prev))
          break
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault()
          setDirection((prev) => (prev.y !== -1 ? { x: 0, y: 1 } : prev))
          break
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault()
          setDirection((prev) => (prev.x !== 1 ? { x: -1, y: 0 } : prev))
          break
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault()
          setDirection((prev) => (prev.x !== -1 ? { x: 1, y: 0 } : prev))
          break
        case " ":
        case "p":
        case "P":
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying])

  useEffect(() => {
    if (!isPlaying || isPaused) return

    const gameInterval = setInterval(moveSnake, difficulty.speed)
    return () => clearInterval(gameInterval)
  }, [moveSnake, isPlaying, isPaused, difficulty.speed])

  const getSnakeSegmentStyle = (index, isHead = false) => {
    if (isHead) {
      return "bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-700 shadow-lg transform scale-110"
    }

    // Gradient effect for body segments
    const opacity = Math.max(0.6, 1 - index * 0.05)
    return `bg-gradient-to-br from-green-300 to-green-500 border border-green-600 shadow-md`
  }

  const renderBoard = () => {
    const board = []
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        let cellType = "empty"
        let segmentIndex = -1

        const snakeSegment = snake.findIndex((segment) => segment.x === x && segment.y === y)
        if (snakeSegment !== -1) {
          cellType = snakeSegment === 0 ? "head" : "body"
          segmentIndex = snakeSegment
        } else if (food.x === x && food.y === y) {
          cellType = "food"
        }

        board.push(
          <motion.div
            key={`${x}-${y}`}
            initial={{ scale: 0.8 }}
            animate={{
              scale: cellType === "food" ? [1, 1.2, 1] : 1,
              rotate:
                cellType === "head"
                  ? direction.x === 1
                    ? 0
                    : direction.x === -1
                      ? 180
                      : direction.y === 1
                        ? 90
                        : 270
                  : 0,
            }}
            transition={{
              scale: { duration: 0.5, repeat: cellType === "food" ? Number.POSITIVE_INFINITY : 0 },
              rotate: { duration: 0.1 },
            }}
            className={`w-4 h-4 flex items-center justify-center text-xs ${
              cellType === "head"
                ? getSnakeSegmentStyle(segmentIndex, true)
                : cellType === "body"
                  ? getSnakeSegmentStyle(segmentIndex)
                  : cellType === "food"
                    ? "bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-700 shadow-lg rounded-full"
                    : "bg-gray-800/10 border border-gray-700/20"
            }`}
          >
            {cellType === "head" && "👁️"}
            {cellType === "food" && foodType}
          </motion.div>,
        )
      }
    }
    return board
  }

  return (
    <Card className="w-fit mx-auto overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-900 to-emerald-800">
      <CardHeader className="pb-3 bg-gradient-to-r from-green-700 to-emerald-700 border-b border-green-600">
        <CardTitle className="text-center text-2xl font-bold text-white flex items-center justify-center gap-2">
          🐍 SNAKE GAME
        </CardTitle>

        {/* Difficulty Selection */}
        <div className="flex justify-center gap-1 mt-3">
          {Object.values(DIFFICULTY).map((diff) => (
            <Button
              key={diff.name}
              variant={difficulty.name === diff.name ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficulty(diff)}
              className={
                difficulty.name === diff.name
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  : "border-green-400 text-green-200 hover:bg-green-700 text-xs"
              }
            >
              {diff.name}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 bg-gradient-to-b from-gray-100 to-gray-200">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-4 bg-black/90 rounded-lg p-3 text-green-400 font-mono">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">Score</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {score}
              <AnimatePresence>
                {showScoreAnimation && (
                  <motion.span
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -20, scale: 1.5 }}
                    exit={{ opacity: 0 }}
                    className="absolute ml-2 text-yellow-400"
                  >
                    +{Math.floor(10 * difficulty.multiplier)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1 text-center">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-400" />
              <span className="text-sm">Streak</span>
            </div>
            <div className="text-xl font-bold text-orange-400">{streak}</div>
          </div>

          <div className="space-y-1 text-right">
            <div className="text-sm text-gray-400">High Score</div>
            <div className="text-xl font-bold text-yellow-400">{highScore}</div>
          </div>
        </div>

        {/* Game Board */}
        <div className="relative">
          <div
            className="grid gap-0 p-4 bg-gradient-to-br from-green-800 to-green-900 rounded-lg border-4 border-green-600 shadow-inner"
            style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
          >
            {renderBoard()}
          </div>

          {/* Game Overlay */}
          <AnimatePresence>
            {(gameOver || isPaused) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg"
              >
                {gameOver ? (
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-red-400"
                    >
                      GAME OVER
                    </motion.div>
                    <div className="space-y-1">
                      <div className="text-xl text-white">Final Score: {score}</div>
                      {score > 0 && <div className="text-lg text-green-400">Length: {snake.length}</div>}
                      {score === highScore && score > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-yellow-400 font-bold flex items-center justify-center gap-2"
                        >
                          <Trophy className="h-5 w-5" />
                          NEW HIGH SCORE!
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-white">PAUSED</div>
                    <div className="text-lg text-gray-300">Press SPACE or P to continue</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={isPlaying ? togglePause : startGame}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              {isPlaying ? (
                isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Game
                </>
              )}
            </Button>

            {isPlaying && (
              <Button
                onClick={startGame}
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Use arrow keys or WASD to control the snake</p>
            <p>SPACE or P to pause • Eat food to grow and score points!</p>
            <p className="font-medium text-green-700">
              {difficulty.name} Mode: {difficulty.multiplier}x points
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
