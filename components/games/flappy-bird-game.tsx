"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const GAME_HEIGHT = 400
const GAME_WIDTH = 400
const BIRD_SIZE = 20
const PIPE_WIDTH = 50
const PIPE_GAP = 120
const GRAVITY = 0.5
const JUMP_FORCE = -8

export default function FlappyBirdGame() {
  const [bird, setBird] = useState({ y: GAME_HEIGHT / 2, velocity: 0 })
  const [pipes, setPipes] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const jump = useCallback(() => {
    if (!isPlaying) return
    setBird((prev) => ({ ...prev, velocity: JUMP_FORCE }))
  }, [isPlaying])

  const startGame = () => {
    setBird({ y: GAME_HEIGHT / 2, velocity: 0 })
    setPipes([])
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
  }

  const generatePipe = useCallback(() => {
    const pipeHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50
    return {
      x: GAME_WIDTH,
      topHeight: pipeHeight,
      bottomY: pipeHeight + PIPE_GAP,
      passed: false,
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return

    const gameLoop = setInterval(() => {
      // Update bird
      setBird((prev) => {
        const newY = prev.y + prev.velocity
        const newVelocity = prev.velocity + GRAVITY

        // Check ground/ceiling collision
        if (newY <= 0 || newY >= GAME_HEIGHT - BIRD_SIZE) {
          setGameOver(true)
          setIsPlaying(false)
          return prev
        }

        return { y: newY, velocity: newVelocity }
      })

      // Update pipes
      setPipes((prev) => {
        let newPipes = prev.map((pipe) => ({ ...pipe, x: pipe.x - 2 }))

        // Remove pipes that are off screen
        newPipes = newPipes.filter((pipe) => pipe.x > -PIPE_WIDTH)

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          newPipes.push(generatePipe())
        }

        return newPipes
      })
    }, 16)

    return () => clearInterval(gameLoop)
  }, [isPlaying, generatePipe])

  useEffect(() => {
    // Check collisions and score
    pipes.forEach((pipe) => {
      const birdLeft = 50
      const birdRight = birdLeft + BIRD_SIZE
      const birdTop = bird.y
      const birdBottom = bird.y + BIRD_SIZE

      const pipeLeft = pipe.x
      const pipeRight = pipe.x + PIPE_WIDTH

      // Check collision
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
          setGameOver(true)
          setIsPlaying(false)
        }
      }

      // Check score
      if (!pipe.passed && pipe.x + PIPE_WIDTH < birdLeft) {
        pipe.passed = true
        setScore((prev) => prev + 1)
      }
    })
  }, [bird, pipes])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault()
        jump()
      }
    }

    const handleClick = () => {
      jump()
    }

    window.addEventListener("keydown", handleKeyPress)
    window.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      window.removeEventListener("click", handleClick)
    }
  }, [jump])

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Flappy Bird</CardTitle>
        <div className="text-center">
          <div className="text-2xl font-bold">Score: {score}</div>
          {gameOver && <div className="text-red-500 font-bold">Game Over!</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="relative bg-sky-200 border-2 border-gray-400 mx-auto overflow-hidden"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          {/* Bird */}
          <div
            className="absolute w-5 h-5 bg-yellow-400 rounded-full border-2 border-orange-400"
            style={{
              left: 50,
              top: bird.y,
              transition: "none",
            }}
          />

          {/* Pipes */}
          {pipes.map((pipe, index) => (
            <div key={index}>
              {/* Top pipe */}
              <div
                className="absolute bg-green-500 border-2 border-green-700"
                style={{
                  left: pipe.x,
                  top: 0,
                  width: PIPE_WIDTH,
                  height: pipe.topHeight,
                }}
              />
              {/* Bottom pipe */}
              <div
                className="absolute bg-green-500 border-2 border-green-700"
                style={{
                  left: pipe.x,
                  top: pipe.bottomY,
                  width: PIPE_WIDTH,
                  height: GAME_HEIGHT - pipe.bottomY,
                }}
              />
            </div>
          ))}

          {/* Ground */}
          <div className="absolute bottom-0 w-full h-2 bg-green-600" />
        </div>

        <div className="text-center space-y-2">
          <Button onClick={startGame} className="w-full">
            {isPlaying ? "Restart" : "Start Game"}
          </Button>

          <div className="text-sm text-muted-foreground">Click or press Space to jump. Avoid the pipes!</div>
        </div>
      </CardContent>
    </Card>
  )
}
