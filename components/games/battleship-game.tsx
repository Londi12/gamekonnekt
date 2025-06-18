"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Ship types and sizes
const SHIPS = {
  carrier: { size: 5, label: "Carrier" },
  battleship: { size: 4, label: "Battleship" },
  cruiser: { size: 3, label: "Cruiser" },
  submarine: { size: 3, label: "Submarine" },
  destroyer: { size: 2, label: "Destroyer" }
}

// Cell states
type CellState = "empty" | "ship" | "hit" | "miss"

// Ship placement
interface ShipPlacement {
  type: keyof typeof SHIPS
  positions: { row: number; col: number }[]
  isVertical: boolean
  isPlaced: boolean
}

// Game phases
type GamePhase = "setup" | "playing" | "gameOver"

export default function BattleshipGame() {
  // Game boards (10x10 grid)
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(
    Array(10).fill(null).map(() => Array(10).fill("empty"))
  )
  const [computerBoard, setComputerBoard] = useState<CellState[][]>(
    Array(10).fill(null).map(() => Array(10).fill("empty"))
  )

  // Ship placements
  const [playerShips, setPlayerShips] = useState<ShipPlacement[]>([])
  const [computerShips, setComputerShips] = useState<ShipPlacement[]>([])

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup")
  const [currentShip, setCurrentShip] = useState<keyof typeof SHIPS | null>(null)
  const [isVertical, setIsVertical] = useState(false)
  const [message, setMessage] = useState("Place your ships on the board")
  const [winner, setWinner] = useState<"player" | "computer" | null>(null)
  const [playerTurn, setPlayerTurn] = useState(true)

  // Setup phase - initialize ships
  useEffect(() => {
    initializeGame()
  }, [])

  // Computer's turn
  useEffect(() => {
    if (gamePhase === "playing" && !playerTurn) {
      const timer = setTimeout(() => {
        computerMove()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [gamePhase, playerTurn])

  // Initialize the game
  const initializeGame = () => {
    // Reset boards
    setPlayerBoard(Array(10).fill(null).map(() => Array(10).fill("empty")))
    setComputerBoard(Array(10).fill(null).map(() => Array(10).fill("empty")))

    // Initialize ships
    const initialShips: ShipPlacement[] = Object.keys(SHIPS).map(shipType => ({
      type: shipType as keyof typeof SHIPS,
      positions: [],
      isVertical: false,
      isPlaced: false
    }))

    setPlayerShips([...initialShips])
    setComputerShips([...initialShips])

    // Reset game state
    setGamePhase("setup")
    setCurrentShip("carrier")
    setIsVertical(false)
    setMessage("Place your ships on the board")
    setWinner(null)
    setPlayerTurn(true)

    // Place computer ships randomly
    placeComputerShips()
  }

  // Place computer ships randomly
  const placeComputerShips = () => {
    const newBoard = Array(10).fill(null).map(() => Array(10).fill("empty"))
    const newShips = Object.keys(SHIPS).map(shipType => ({
      type: shipType as keyof typeof SHIPS,
      positions: [],
      isVertical: Math.random() > 0.5,
      isPlaced: false
    }))

    for (const ship of newShips) {
      let placed = false

      while (!placed) {
        const isVertical = Math.random() > 0.5
        const shipSize = SHIPS[ship.type].size

        // Generate random position
        const row = Math.floor(Math.random() * (isVertical ? (10 - shipSize) : 10))
        const col = Math.floor(Math.random() * (isVertical ? 10 : (10 - shipSize)))

        // Check if position is valid
        let isValid = true
        const positions = []

        for (let i = 0; i < shipSize; i++) {
          const r = isVertical ? row + i : row
          const c = isVertical ? col : col + i

          if (newBoard[r][c] !== "empty") {
            isValid = false
            break
          }

          positions.push({ row: r, col: c })
        }

        if (isValid) {
          // Place ship
          for (const pos of positions) {
            newBoard[pos.row][pos.col] = "ship"
          }

          ship.positions = positions
          ship.isVertical = isVertical
          ship.isPlaced = true
          placed = true
        }
      }
    }

    setComputerShips(newShips)
  }

  // Handle player board hover during setup
  const handlePlayerBoardHover = (row: number, col: number) => {
    if (gamePhase !== "setup" || !currentShip) return null

    const shipSize = SHIPS[currentShip].size
    const positions = []

    // Calculate ship positions
    for (let i = 0; i < shipSize; i++) {
      const r = isVertical ? row + i : row
      const c = isVertical ? col : col + i

      // Check if position is valid
      if (r >= 10 || c >= 10) {
        return "invalid"
      }

      // Check if position overlaps with existing ships
      if (playerBoard[r][c] === "ship") {
        return "invalid"
      }

      positions.push({ row: r, col: c })
    }

    return positions
  }

  // Handle player board click during setup
  const handlePlayerBoardClick = (row: number, col: number) => {
    if (gamePhase !== "setup" || !currentShip) return

    const positions = handlePlayerBoardHover(row, col)

    if (!positions || positions === "invalid") {
      setMessage("Invalid position. Try again.")
      return
    }

    // Place ship
    const newBoard = [...playerBoard.map(row => [...row])]
    for (const pos of positions) {
      newBoard[pos.row][pos.col] = "ship"
    }

    // Update ship placement
    const newShips = [...playerShips]
    const shipIndex = newShips.findIndex(ship => ship.type === currentShip)

    if (shipIndex !== -1) {
      newShips[shipIndex] = {
        ...newShips[shipIndex],
        positions,
        isVertical,
        isPlaced: true
      }
    }

    setPlayerBoard(newBoard)
    setPlayerShips(newShips)

    // Move to next ship or start game
    const nextShipIndex = Object.keys(SHIPS).findIndex(
      shipType => shipType === currentShip
    ) + 1

    if (nextShipIndex < Object.keys(SHIPS).length) {
      const nextShipType = Object.keys(SHIPS)[nextShipIndex] as keyof typeof SHIPS
      setCurrentShip(nextShipType)
      setMessage(`Place your ${SHIPS[nextShipType].label} (${SHIPS[nextShipType].size} cells)`)
    } else {
      setCurrentShip(null)
      setMessage("All ships placed! Click 'Start Game' to begin.")
    }
  }

  // Start the game
  const startGame = () => {
    // Check if all ships are placed
    if (playerShips.some(ship => !ship.isPlaced)) {
      setMessage("Place all your ships before starting the game.")
      return
    }

    setGamePhase("playing")
    setMessage("Your turn! Click on the computer's board to fire.")
    setPlayerTurn(true)
  }

  // Handle player attack on computer board
  const handleComputerBoardClick = (row: number, col: number) => {
    if (gamePhase !== "playing" || !playerTurn) return
    if (computerBoard[row][col] === "hit" || computerBoard[row][col] === "miss") return

    const newBoard = [...computerBoard.map(row => [...row])]
    const isHit = newBoard[row][col] === "ship"

    newBoard[row][col] = isHit ? "hit" : "miss"
    setComputerBoard(newBoard)

    if (isHit) {
      // Check if ship is sunk
      const hitShip = computerShips.find(ship => 
        ship.positions.some(pos => pos.row === row && pos.col === col)
      )

      if (hitShip) {
        const allPositionsHit = hitShip.positions.every(pos => 
          newBoard[pos.row][pos.col] === "hit"
        )

        if (allPositionsHit) {
          setMessage(`You sunk the computer's ${SHIPS[hitShip.type].label}!`)
        } else {
          setMessage("Hit!")
        }
      }

      // Check for win
      const allShipsSunk = computerShips.every(ship => 
        ship.positions.every(pos => newBoard[pos.row][pos.col] === "hit")
      )

      if (allShipsSunk) {
        setGamePhase("gameOver")
        setWinner("player")
        setMessage("Congratulations! You won!")
        return
      }
    } else {
      setMessage("Miss! Computer's turn.")
    }

    // Switch to computer's turn
    setPlayerTurn(false)
  }

  // Computer's move
  const computerMove = () => {
    if (gamePhase !== "playing") return

    const newBoard = [...playerBoard.map(row => [...row])]

    // Simple AI: randomly select a cell that hasn't been attacked yet
    let row, col
    let validMove = false

    while (!validMove) {
      row = Math.floor(Math.random() * 10)
      col = Math.floor(Math.random() * 10)

      if (newBoard[row][col] !== "hit" && newBoard[row][col] !== "miss") {
        validMove = true
      }
    }

    const isHit = newBoard[row][col] === "ship"
    newBoard[row][col] = isHit ? "hit" : "miss"
    setPlayerBoard(newBoard)

    if (isHit) {
      // Check if ship is sunk
      const hitShip = playerShips.find(ship => 
        ship.positions.some(pos => pos.row === row && pos.col === col)
      )

      if (hitShip) {
        const allPositionsHit = hitShip.positions.every(pos => 
          newBoard[pos.row][pos.col] === "hit"
        )

        if (allPositionsHit) {
          setMessage(`The computer sunk your ${SHIPS[hitShip.type].label}!`)
        } else {
          setMessage("The computer hit your ship!")
        }
      }

      // Check for win
      const allShipsSunk = playerShips.every(ship => 
        ship.positions.every(pos => newBoard[pos.row][pos.col] === "hit")
      )

      if (allShipsSunk) {
        setGamePhase("gameOver")
        setWinner("computer")
        setMessage("Game over! The computer won.")
        return
      }
    } else {
      setMessage("The computer missed! Your turn.")
    }

    // Switch back to player's turn
    setPlayerTurn(true)
  }

  // Render a cell on the player's board
  const renderPlayerCell = (row: number, col: number) => {
    const cellState = playerBoard[row][col]
    const hoverPositions = gamePhase === "setup" && currentShip 
      ? handlePlayerBoardHover(row, col) 
      : null

    const isHovering = Array.isArray(hoverPositions) && 
      hoverPositions.some(pos => pos.row === row && pos.col === col)

    const isInvalidHover = hoverPositions === "invalid" && 
      (isVertical 
        ? (row <= 10 - SHIPS[currentShip].size && col < 10) 
        : (row < 10 && col <= 10 - SHIPS[currentShip].size))

    return (
      <div
        key={`player-${row}-${col}`}
        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border border-gray-400 flex items-center justify-center relative
          ${cellState === "empty" ? "bg-blue-100" : ""}
          ${cellState === "ship" ? "bg-gray-600" : ""}
          ${cellState === "hit" ? "bg-red-500 animate-pulse-highlight" : ""}
          ${cellState === "miss" ? "bg-blue-300" : ""}
          ${isHovering ? "bg-gray-400" : ""}
          ${isInvalidHover ? "bg-red-200" : ""}
          ${gamePhase === "setup" ? "cursor-pointer hover:bg-blue-200" : ""}`}
        onClick={() => handlePlayerBoardClick(row, col)}
        onContextMenu={(e) => {
          e.preventDefault()
          if (gamePhase === "setup" && currentShip) {
            setIsVertical(!isVertical)
          }
        }}
      >
        {cellState === "hit" && <span className="text-white">✗</span>}
        {cellState === "miss" && <span className="text-blue-700">•</span>}
      </div>
    )
  }

  // Render a cell on the computer's board
  const renderComputerCell = (row: number, col: number) => {
    const cellState = computerBoard[row][col]
    const isClickable = gamePhase === "playing" && playerTurn && 
      cellState !== "hit" && cellState !== "miss"

    return (
      <div
        key={`computer-${row}-${col}`}
        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 border border-gray-400 flex items-center justify-center
          ${cellState === "empty" || cellState === "ship" ? "bg-blue-100" : ""}
          ${cellState === "hit" ? "bg-red-500 animate-pulse-highlight" : ""}
          ${cellState === "miss" ? "bg-blue-300" : ""}
          ${isClickable ? "cursor-pointer hover:bg-blue-200 hover:scale-105 transition-transform" : ""}`}
        onClick={() => handleComputerBoardClick(row, col)}
      >
        {cellState === "hit" && <span className="text-white">✗</span>}
        {cellState === "miss" && <span className="text-blue-700">•</span>}
      </div>
    )
  }

  // Render the ship selection UI
  const renderShipSelection = () => {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Ships:</h3>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsVertical(!isVertical)}
          >
            {isVertical ? "Vertical" : "Horizontal"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SHIPS).map(([shipType, ship]) => {
            const shipObj = playerShips.find(s => s.type === shipType)
            const isPlaced = shipObj?.isPlaced || false
            const isSelected = currentShip === shipType

            return (
              <Button
                key={shipType}
                size="sm"
                variant={isSelected ? "default" : isPlaced ? "outline" : "secondary"}
                className={`${isPlaced ? "opacity-50" : ""}`}
                disabled={isPlaced}
                onClick={() => {
                  if (!isPlaced) {
                    setCurrentShip(shipType as keyof typeof SHIPS)
                    setMessage(`Place your ${ship.label} (${ship.size} cells)`)
                  }
                }}
              >
                {ship.label} ({ship.size})
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Battleship</CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant={gamePhase === "gameOver" ? "outline" : playerTurn ? "default" : "secondary"}>
            {gamePhase === "setup" 
              ? "Setup Phase" 
              : gamePhase === "gameOver"
                ? winner === "player" ? "You Won!" : "Computer Won!"
                : playerTurn ? "Your Turn" : "Computer's Turn"}
          </Badge>
          <Button size="sm" onClick={initializeGame}>New Game</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm">{message}</p>
        </div>

        {gamePhase === "setup" && (
          <div className="space-y-4">
            {renderShipSelection()}

            <div className="flex justify-center">
              <div className="grid grid-cols-10 gap-0">
                {Array(10).fill(null).map((_, row) => (
                  Array(10).fill(null).map((_, col) => renderPlayerCell(row, col))
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <Button 
                onClick={startGame}
                disabled={playerShips.some(ship => !ship.isPlaced)}
              >
                Start Game
              </Button>
            </div>
          </div>
        )}

        {(gamePhase === "playing" || gamePhase === "gameOver") && (
          <Tabs defaultValue="player" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="player">Your Board</TabsTrigger>
              <TabsTrigger value="computer">Computer's Board</TabsTrigger>
            </TabsList>
            <TabsContent value="player" className="pt-4">
              <div className="flex justify-center">
                <div className="grid grid-cols-10 gap-0">
                  {Array(10).fill(null).map((_, row) => (
                    Array(10).fill(null).map((_, col) => renderPlayerCell(row, col))
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Your Ships:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {playerShips.map(ship => {
                    const allHit = ship.positions.every(
                      pos => playerBoard[pos.row][pos.col] === "hit"
                    )
                    return (
                      <div key={ship.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${allHit ? "bg-red-500" : "bg-gray-600"}`}></div>
                        <span className={allHit ? "line-through text-gray-500" : ""}>
                          {SHIPS[ship.type].label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="computer" className="pt-4">
              <div className="flex justify-center">
                <div className="grid grid-cols-10 gap-0">
                  {Array(10).fill(null).map((_, row) => (
                    Array(10).fill(null).map((_, col) => renderComputerCell(row, col))
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Computer's Ships:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {computerShips.map(ship => {
                    const allHit = ship.positions.every(
                      pos => computerBoard[pos.row][pos.col] === "hit"
                    )
                    return (
                      <div key={ship.type} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${allHit ? "bg-red-500" : "bg-gray-600"}`}></div>
                        <span className={allHit ? "line-through text-gray-500" : ""}>
                          {SHIPS[ship.type].label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {gamePhase === "gameOver" && (
          <div className="text-center mt-6">
            <Button onClick={initializeGame}>Play Again</Button>
          </div>
        )}

        <div className="mt-6 text-xs text-center text-muted-foreground">
          {gamePhase === "setup" 
            ? "Right-click to rotate ship. Place all ships to start the game." 
            : "Sink all enemy ships to win!"}
        </div>
      </CardContent>
    </Card>
  )
}
