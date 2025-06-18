"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 320
const PADDLE_WIDTH = 75
const PADDLE_HEIGHT = 10
const BALL_SIZE = 10
const BRICK_ROWS = 5
const BRICK_COLS = 8
const BRICK_WIDTH = 55
const BRICK_HEIGHT = 20

export default function BreakoutGame() {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 3, dy: -3 },
    bricks: [],
    score: 0,
    lives: 3,
    gameOver: false,
    won: false,
    isPlaying: false,
  })

  const initializeBricks = useCallback(() => {
    const bricks = []
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"]

    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: col * (BRICK_WIDTH + 5) + 35,
          y: row * (BRICK_HEIGHT + 5) + 50,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: colors[row],
          visible: true,
        })
      }
    }
    return bricks
  }, [])

  const startGame = useCallback(() => {
    setGameState({
      paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 30 },
      ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 3, dy: -3 },
      bricks: initializeBricks(),
      score: 0,
      lives: 3,
      gameOver: false,
      won: false,
      isPlaying: true,
    })
  }, [initializeBricks])

  const draw = useCallback((ctx, state) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw paddle
    ctx.fillStyle = "#333"
    ctx.fillRect(state.paddle.x, state.paddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

    // Draw ball
    ctx.fillStyle = "#FF6B6B"
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, BALL_SIZE / 2, 0, Math.PI * 2)
    ctx.fill()

    // Draw bricks
    state.bricks.forEach((brick) => {
      if (brick.visible) {
        ctx.fillStyle = brick.color
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
        ctx.strokeStyle = "#FFF"
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
      }
    })

    // Draw score and lives
    ctx.fillStyle = "#333"
    ctx.font = "16px Arial"
    ctx.fillText(`Score: ${state.score}`, 10, 25)
    ctx.fillText(`Lives: ${state.lives}`, CANVAS_WIDTH - 80, 25)

    // Draw game over or win message
    if (state.gameOver || state.won) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      ctx.fillStyle = "#FFF"
      ctx.font = "32px Arial"
      ctx.textAlign = "center"

      if (state.won) {
        ctx.fillText("YOU WIN!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
        ctx.font = "18px Arial"
        ctx.fillText(`Final Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
      } else {
        ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20)
        ctx.font = "18px Arial"
        ctx.fillText(`Final Score: ${state.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20)
      }

      ctx.textAlign = "left"
    }
  }, [])

  const updateGame = useCallback(() => {
    setGameState((prevState) => {
      if (!prevState.isPlaying || prevState.gameOver || prevState.won) {
        return prevState
      }

      const newState = { ...prevState }

      // Move ball
      newState.ball.x += newState.ball.dx
      newState.ball.y += newState.ball.dy

      // Ball collision with walls
      if (newState.ball.x <= BALL_SIZE / 2 || newState.ball.x >= CANVAS_WIDTH - BALL_SIZE / 2) {
        newState.ball.dx = -newState.ball.dx
      }

      if (newState.ball.y <= BALL_SIZE / 2) {
        newState.ball.dy = -newState.ball.dy
      }

      // Ball collision with paddle
      if (
        newState.ball.y + BALL_SIZE / 2 >= newState.paddle.y &&
        newState.ball.x >= newState.paddle.x &&
        newState.ball.x <= newState.paddle.x + PADDLE_WIDTH &&
        newState.ball.dy > 0
      ) {
        newState.ball.dy = -newState.ball.dy

        // Add some angle based on where the ball hits the paddle
        const hitPos = (newState.ball.x - newState.paddle.x) / PADDLE_WIDTH
        newState.ball.dx = (hitPos - 0.5) * 6
      }

      // Ball collision with bricks
      newState.bricks.forEach((brick) => {
        if (
          brick.visible &&
          newState.ball.x >= brick.x &&
          newState.ball.x <= brick.x + brick.width &&
          newState.ball.y >= brick.y &&
          newState.ball.y <= brick.y + brick.height
        ) {
          brick.visible = false
          newState.ball.dy = -newState.ball.dy
          newState.score += 10
        }
      })

      // Check for win
      if (newState.bricks.every((brick) => !brick.visible)) {
        newState.won = true
        newState.isPlaying = false
      }

      // Ball falls below paddle
      if (newState.ball.y > CANVAS_HEIGHT) {
        newState.lives--
        if (newState.lives <= 0) {
          newState.gameOver = true
          newState.isPlaying = false
        } else {
          // Reset ball position
          newState.ball.x = CANVAS_WIDTH / 2
          newState.ball.y = CANVAS_HEIGHT / 2
          newState.ball.dx = 3
          newState.ball.dy = -3
        }
      }

      return newState
    })
  }, [])

  useEffect(() => {
    if (!gameState.isPlaying) return

    const gameLoop = setInterval(updateGame, 16)
    return () => clearInterval(gameLoop)
  }, [gameState.isPlaying, updateGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    draw(ctx, gameState)
  }, [gameState, draw])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!gameState.isPlaying) return

      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left

      setGameState((prevState) => ({
        ...prevState,
        paddle: {
          ...prevState.paddle,
          x: Math.max(0, Math.min(mouseX - PADDLE_WIDTH / 2, CANVAS_WIDTH - PADDLE_WIDTH)),
        },
      }))
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove)
      return () => canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [gameState.isPlaying])

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Breakout</CardTitle>
        <div className="text-center space-y-1">
          <div className="text-lg">
            Score: {gameState.score} | Lives: {gameState.lives}
          </div>
          {gameState.won && <div className="text-green-500 font-bold">🎉 You Won!</div>}
          {gameState.gameOver && <div className="text-red-500 font-bold">Game Over!</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-400 bg-gradient-to-b from-blue-100 to-blue-200"
            style={{ cursor: gameState.isPlaying ? "none" : "default" }}
          />
        </div>

        <div className="text-center space-y-2">
          <Button onClick={startGame} className="w-full">
            {gameState.isPlaying ? "Restart" : "Start Game"}
          </Button>

          <div className="text-sm text-muted-foreground">
            Move your mouse to control the paddle. Break all the bricks to win!
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
