"use client"

import { useState, useEffect } from "react"

type GameState = {
  highScore: number
  lastPlayed: string
  savedState?: any
}

type GameStates = {
  [gameId: string]: GameState
}

/**
 * Custom hook for persisting game state in localStorage
 * @param gameId - Unique identifier for the game
 * @param initialState - Initial state if no saved state exists
 * @returns Object with game state and functions to update it
 */
export function useGameState(gameId: string, initialState: any = {}) {
  // Initialize state with a function to avoid unnecessary localStorage access during SSR
  const [state, setState] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [highScore, setHighScore] = useState(0)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedStates = localStorage.getItem("gamekonnekt-states")
      const allStates: GameStates = savedStates ? JSON.parse(savedStates) : {}
      
      const gameState = allStates[gameId]
      
      if (gameState) {
        setState(gameState.savedState || initialState)
        setHighScore(gameState.highScore || 0)
      } else {
        setState(initialState)
        setHighScore(0)
      }
    } catch (error) {
      console.error("Error loading game state:", error)
      setState(initialState)
      setHighScore(0)
    } finally {
      setIsLoading(false)
    }
  }, [gameId, initialState])

  // Save state to localStorage
  const saveState = (newState: any) => {
    if (typeof window === "undefined") return

    try {
      setState(newState)
      
      const savedStates = localStorage.getItem("gamekonnekt-states")
      const allStates: GameStates = savedStates ? JSON.parse(savedStates) : {}
      
      allStates[gameId] = {
        highScore: highScore,
        lastPlayed: new Date().toISOString(),
        savedState: newState
      }
      
      localStorage.setItem("gamekonnekt-states", JSON.stringify(allStates))
    } catch (error) {
      console.error("Error saving game state:", error)
    }
  }

  // Update high score
  const updateHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score)
      
      try {
        const savedStates = localStorage.getItem("gamekonnekt-states")
        const allStates: GameStates = savedStates ? JSON.parse(savedStates) : {}
        
        allStates[gameId] = {
          ...(allStates[gameId] || {}),
          highScore: score,
          lastPlayed: new Date().toISOString()
        }
        
        localStorage.setItem("gamekonnekt-states", JSON.stringify(allStates))
      } catch (error) {
        console.error("Error updating high score:", error)
      }
    }
  }

  // Reset game state
  const resetState = () => {
    setState(initialState)
    
    try {
      const savedStates = localStorage.getItem("gamekonnekt-states")
      const allStates: GameStates = savedStates ? JSON.parse(savedStates) : {}
      
      if (allStates[gameId]) {
        // Keep the high score but reset the saved state
        allStates[gameId] = {
          highScore: allStates[gameId].highScore,
          lastPlayed: new Date().toISOString(),
          savedState: initialState
        }
        
        localStorage.setItem("gamekonnekt-states", JSON.stringify(allStates))
      }
    } catch (error) {
      console.error("Error resetting game state:", error)
    }
  }

  return {
    state,
    isLoading,
    highScore,
    saveState,
    updateHighScore,
    resetState
  }
}