"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const EMOJIS = ["🌞", "🌈", "🍕", "🚀", "🐶", "⚽", "🎉", "🎸", "🌸", "🦋", "🍎", "🎯"]

export default function MemoryGame() {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const initializeGame = () => {
    const gameEmojis = EMOJIS.slice(0, 8)
    const cardPairs = [...gameEmojis, ...gameEmojis]
    const shuffledCards = cardPairs
      .map((emoji, index) => ({ id: index, emoji, matched: false }))
      .sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameWon(false)
  }

  useEffect(() => {
    initializeGame()
  }, [])

  useEffect(() => {
    if (matchedPairs === 8) {
      setGameWon(true)
    }
  }, [matchedPairs])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      setMoves((prev) => prev + 1)

      if (cards[first].emoji === cards[second].emoji) {
        setCards((prev) =>
          prev.map((card, index) => (index === first || index === second ? { ...card, matched: true } : card)),
        )
        setMatchedPairs((prev) => prev + 1)
        setFlippedCards([])
      } else {
        setTimeout(() => {
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  const handleCardClick = (index) => {
    if (flippedCards.length === 2 || flippedCards.includes(index) || cards[index].matched) {
      return
    }

    setFlippedCards((prev) => [...prev, index])
  }

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Memory Match</CardTitle>
        <div className="text-center space-y-1">
          <div className="text-lg">Moves: {moves}</div>
          <div className="text-lg">Pairs: {matchedPairs}/8</div>
          {gameWon && <div className="text-green-500 font-bold">Congratulations! You Won!</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card, index) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`w-16 h-16 rounded-lg text-2xl font-bold transition-all duration-300 ${
                flippedCards.includes(index) || card.matched
                  ? "bg-white border-2 border-blue-300 shadow-md"
                  : "bg-blue-500 hover:bg-blue-600 shadow-lg"
              }`}
              disabled={flippedCards.includes(index) || card.matched}
            >
              {(flippedCards.includes(index) || card.matched) && card.emoji}
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={initializeGame} className="w-full">
            New Game
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
