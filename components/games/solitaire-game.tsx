"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define card suits, values, and colors
const SUITS = ["♥", "♦", "♠", "♣"]
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const COLORS = {
  "♥": "text-red-600",
  "♦": "text-red-600",
  "♠": "text-black",
  "♣": "text-black",
}

// Card interface
interface PlayingCard {
  suit: string
  value: string
  faceUp: boolean
  id: string
}

export default function SolitaireGame() {
  // Game state
  const [deck, setDeck] = useState<PlayingCard[]>([])
  const [stock, setStock] = useState<PlayingCard[]>([])
  const [waste, setWaste] = useState<PlayingCard[]>([])
  const [foundations, setFoundations] = useState<PlayingCard[][]>(Array(4).fill([]).map(() => []))
  const [tableaus, setTableaus] = useState<PlayingCard[][]>(Array(7).fill([]).map(() => []))
  const [selectedCard, setSelectedCard] = useState<{card: PlayingCard, source: string, index: number} | null>(null)
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isGameWon, setIsGameWon] = useState(false)

  // Initialize game
  useEffect(() => {
    initializeGame()
  }, [])

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (startTime && !isGameWon) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [startTime, isGameWon])

  // Check for win condition
  useEffect(() => {
    if (foundations.every(pile => pile.length === 13)) {
      setIsGameWon(true)
    }
  }, [foundations])

  // Create and shuffle a new deck
  const createDeck = (): PlayingCard[] => {
    const newDeck: PlayingCard[] = []

    for (const suit of SUITS) {
      for (const value of VALUES) {
        newDeck.push({
          suit,
          value,
          faceUp: false,
          id: `${value}-${suit}`
        })
      }
    }

    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }

    return newDeck
  }

  // Initialize the game
  const initializeGame = () => {
    const newDeck = createDeck()
    const newTableaus: PlayingCard[][] = Array(7).fill([]).map(() => [])

    // Deal cards to tableaus
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = newDeck.pop()!
        // Only the top card is face up
        if (j === i) {
          card.faceUp = true
        }
        newTableaus[i].push(card)
      }
    }

    setDeck(newDeck)
    setStock(newDeck)
    setWaste([])
    setFoundations(Array(4).fill([]).map(() => []))
    setTableaus(newTableaus)
    setSelectedCard(null)
    setMoves(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setIsGameWon(false)
  }

  // Draw cards from stock to waste
  const drawCard = () => {
    if (stock.length === 0) {
      // Reset stock from waste
      setStock([...waste].reverse().map(card => ({...card, faceUp: false})))
      setWaste([])
      return
    }

    const newStock = [...stock]
    const newWaste = [...waste]
    const card = newStock.pop()!
    card.faceUp = true
    newWaste.push(card)

    setStock(newStock)
    setWaste(newWaste)
    setMoves(moves + 1)
  }

  // Handle card selection
  const selectCard = (card: PlayingCard, source: string, index: number) => {
    if (!card.faceUp) return

    if (selectedCard) {
      // Try to move the previously selected card to the new location
      moveCard(selectedCard, source, index)
      setSelectedCard(null)
    } else {
      // Select this card
      setSelectedCard({card, source, index})
    }
  }

  // Check if a card can be moved to a foundation
  const canMoveToFoundation = (card: PlayingCard, foundationIndex: number): boolean => {
    const foundation = foundations[foundationIndex]

    if (foundation.length === 0) {
      // Only Aces can be placed on empty foundations
      return card.value === "A"
    }

    const topCard = foundation[foundation.length - 1]

    // Must be same suit and next value
    return (
      card.suit === topCard.suit &&
      VALUES.indexOf(card.value) === VALUES.indexOf(topCard.value) + 1
    )
  }

  // Check if a card can be moved to a tableau
  const canMoveToTableau = (card: PlayingCard, tableauIndex: number): boolean => {
    const tableau = tableaus[tableauIndex]

    if (tableau.length === 0) {
      // Only Kings can be placed on empty tableaus
      return card.value === "K"
    }

    const topCard = tableau[tableau.length - 1]

    // Must be alternate color and one value lower
    const isAlternateColor = 
      (COLORS[card.suit].includes("red") && COLORS[topCard.suit].includes("black")) ||
      (COLORS[card.suit].includes("black") && COLORS[topCard.suit].includes("red"))

    return (
      isAlternateColor &&
      VALUES.indexOf(card.value) === VALUES.indexOf(topCard.value) - 1
    )
  }

  // Move a card from one place to another
  const moveCard = (
    selected: {card: PlayingCard, source: string, index: number},
    targetSource: string,
    targetIndex: number
  ) => {
    const {card, source, index} = selected

    // Moving to foundation
    if (targetSource === "foundation") {
      if (canMoveToFoundation(card, targetIndex)) {
        // Remove card from source
        if (source === "waste") {
          const newWaste = [...waste]
          newWaste.pop()
          setWaste(newWaste)
        } else if (source === "tableau") {
          const newTableaus = [...tableaus]
          const tableau = [...newTableaus[index]]
          tableau.pop()

          // Flip the new top card if needed
          if (tableau.length > 0 && !tableau[tableau.length - 1].faceUp) {
            tableau[tableau.length - 1].faceUp = true
          }

          newTableaus[index] = tableau
          setTableaus(newTableaus)
        }

        // Add card to foundation
        const newFoundations = [...foundations]
        newFoundations[targetIndex] = [...newFoundations[targetIndex], card]
        setFoundations(newFoundations)
        setMoves(moves + 1)
      }
    }

    // Moving to tableau
    else if (targetSource === "tableau") {
      if (canMoveToTableau(card, targetIndex)) {
        // Remove card from source
        if (source === "waste") {
          const newWaste = [...waste]
          newWaste.pop()
          setWaste(newWaste)
        } else if (source === "tableau") {
          const newTableaus = [...tableaus]
          const tableau = [...newTableaus[index]]
          tableau.pop()

          // Flip the new top card if needed
          if (tableau.length > 0 && !tableau[tableau.length - 1].faceUp) {
            tableau[tableau.length - 1].faceUp = true
          }

          newTableaus[index] = tableau
          setTableaus(newTableaus)
        } else if (source === "foundation") {
          const newFoundations = [...foundations]
          const foundation = [...newFoundations[index]]
          foundation.pop()
          newFoundations[index] = foundation
          setFoundations(newFoundations)
        }

        // Add card to tableau
        const newTableaus = [...tableaus]
        newTableaus[targetIndex] = [...newTableaus[targetIndex], card]
        setTableaus(newTableaus)
        setMoves(moves + 1)
      }
    }
  }

  // Auto-move cards to foundations when possible
  const autoComplete = () => {
    let moved = true

    while (moved) {
      moved = false

      // Check waste
      if (waste.length > 0) {
        const card = waste[waste.length - 1]
        for (let i = 0; i < 4; i++) {
          if (canMoveToFoundation(card, i)) {
            moveCard({card, source: "waste", index: 0}, "foundation", i)
            moved = true
            break
          }
        }
      }

      // Check tableaus
      for (let i = 0; i < 7; i++) {
        const tableau = tableaus[i]
        if (tableau.length > 0) {
          const card = tableau[tableau.length - 1]
          if (card.faceUp) {
            for (let j = 0; j < 4; j++) {
              if (canMoveToFoundation(card, j)) {
                moveCard({card, source: "tableau", index: i}, "foundation", j)
                moved = true
                break
              }
            }
          }
        }
      }
    }
  }

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Solitaire</CardTitle>
        <div className="flex justify-between items-center">
          <Badge variant="outline">Moves: {moves}</Badge>
          <Badge variant="outline">Time: {formatTime(elapsedTime)}</Badge>
          <div className="flex gap-2">
            <Button size="sm" onClick={initializeGame}>New Game</Button>
            <Button size="sm" onClick={autoComplete}>Auto Complete</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isGameWon ? (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">🎉 You Won! 🎉</h2>
            <p className="text-xl mb-6">
              Completed in {moves} moves and {formatTime(elapsedTime)}
            </p>
            <Button onClick={initializeGame}>Play Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stock, Waste, and Foundations */}
            <div className="flex justify-between gap-4">
              <div className="flex gap-4">
                {/* Stock */}
                <div 
                  className="w-12 h-20 sm:w-14 sm:h-22 md:w-16 md:h-24 rounded border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={drawCard}
                >
                  {stock.length > 0 ? (
                    <div className="w-14 h-20 rounded bg-blue-600 flex items-center justify-center text-white">
                      {stock.length}
                    </div>
                  ) : (
                    <div className="text-gray-400">↻</div>
                  )}
                </div>

                {/* Waste */}
                <div className="w-12 h-20 sm:w-14 sm:h-22 md:w-16 md:h-24 rounded border-2 border-gray-300 flex items-center justify-center">
                  {waste.length > 0 && (
                    <div 
                      className={`w-10 h-16 sm:w-12 sm:h-18 md:w-14 md:h-20 rounded bg-white border border-gray-300 flex items-center justify-center text-lg sm:text-xl font-bold cursor-pointer ${COLORS[waste[waste.length - 1].suit]} ${selectedCard?.card.id === waste[waste.length - 1].id ? "animate-pulse-highlight" : "hover:bg-gray-50"}`}
                      onClick={() => selectCard(waste[waste.length - 1], "waste", 0)}
                    >
                      {waste[waste.length - 1].value}{waste[waste.length - 1].suit}
                    </div>
                  )}
                </div>
              </div>

              {/* Foundations */}
              <div className="flex gap-4">
                {foundations.map((foundation, i) => (
                  <div 
                    key={i}
                    className="w-12 h-20 sm:w-14 sm:h-22 md:w-16 md:h-24 rounded border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      if (selectedCard) {
                        moveCard(selectedCard, "foundation", i)
                        setSelectedCard(null)
                      } else if (foundation.length > 0) {
                        selectCard(foundation[foundation.length - 1], "foundation", i)
                      }
                    }}
                  >
                    {foundation.length > 0 ? (
                      <div 
                        className={`w-10 h-16 sm:w-12 sm:h-18 md:w-14 md:h-20 rounded bg-white border border-gray-300 flex items-center justify-center text-lg sm:text-xl font-bold ${COLORS[foundation[foundation.length - 1].suit]} ${selectedCard?.card.id === foundation[foundation.length - 1].id ? "animate-pulse-highlight" : ""}`}
                      >
                        {foundation[foundation.length - 1].value}{foundation[foundation.length - 1].suit}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">A→K</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tableaus */}
            <div className="flex justify-between gap-2">
              {tableaus.map((tableau, i) => (
                <div 
                  key={i}
                  className="w-12 min-h-20 sm:w-14 sm:min-h-22 md:w-16 md:min-h-24 rounded border-2 border-gray-300 flex flex-col items-center pt-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (selectedCard && tableau.length === 0) {
                      moveCard(selectedCard, "tableau", i)
                      setSelectedCard(null)
                    }
                  }}
                >
                  {tableau.map((card, j) => (
                    <div 
                      key={card.id}
                      className={`w-10 h-6 sm:w-12 sm:h-7 md:w-14 md:h-8 ${j === tableau.length - 1 ? 'h-16 sm:h-18 md:h-20' : ''} rounded ${card.faceUp ? `bg-white border border-gray-300 flex items-center justify-center text-xs sm:text-sm font-bold ${COLORS[card.suit]} ${selectedCard?.card.id === card.id ? "animate-pulse-highlight" : "hover:bg-gray-50"}` : 'bg-blue-600'}`}
                      style={{
                        marginTop: j > 0 ? "-12px" : "0",
                        zIndex: j
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (card.faceUp) {
                          selectCard(card, "tableau", i)
                        }
                      }}
                    >
                      {card.faceUp && (
                        <span>{card.value}{card.suit}</span>
                      )}
                    </div>
                  ))}
                  {tableau.length === 0 && (
                    <div className="text-gray-400 text-xs h-16 sm:h-18 md:h-20 flex items-center">K</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-center text-muted-foreground">
          Build up foundations by suit from Ace to King. Build down tableaus by alternate colors.
        </div>
      </CardContent>
    </Card>
  )
}
