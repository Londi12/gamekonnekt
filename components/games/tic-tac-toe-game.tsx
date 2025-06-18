"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TicTacToeGame() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)
  const [gameMode, setGameMode] = useState("human") // "human" or "ai"
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] }
      }
    }
    return null
  }

  const minimax = (squares, depth, isMaximizing) => {
    const result = calculateWinner(squares)

    if (result?.winner === "O") return 10 - depth
    if (result?.winner === "X") return depth - 10
    if (squares.every((square) => square !== null)) return 0

    if (isMaximizing) {
      let bestScore = Number.NEGATIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "O"
          const score = minimax(squares, depth + 1, false)
          squares[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Number.POSITIVE_INFINITY
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = "X"
          const score = minimax(squares, depth + 1, true)
          squares[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }

  const getBestMove = (squares) => {
    let bestScore = Number.NEGATIVE_INFINITY
    let bestMove = 0

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = "O"
        const score = minimax(squares, 0, false)
        squares[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }
    return bestMove
  }

  const handleClick = useCallback(
    (i) => {
      if (board[i] || calculateWinner(board)) return

      const newBoard = [...board]
      newBoard[i] = isXNext ? "X" : "O"
      setBoard(newBoard)

      const result = calculateWinner(newBoard)
      if (result) {
        setScores((prev) => ({
          ...prev,
          [result.winner]: prev[result.winner] + 1,
        }))
      } else if (newBoard.every((square) => square !== null)) {
        setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
      }

      setIsXNext(!isXNext)

      // AI move
      if (gameMode === "ai" && !result && !newBoard.every((square) => square !== null)) {
        setTimeout(() => {
          const aiBoard = [...newBoard]
          const aiMove = getBestMove(aiBoard)
          aiBoard[aiMove] = "O"
          setBoard(aiBoard)

          const aiResult = calculateWinner(aiBoard)
          if (aiResult) {
            setScores((prev) => ({
              ...prev,
              [aiResult.winner]: prev[aiResult.winner] + 1,
            }))
          } else if (aiBoard.every((square) => square !== null)) {
            setScores((prev) => ({ ...prev, draws: prev.draws + 1 }))
          }

          setIsXNext(true)
        }, 500)
      }
    },
    [board, isXNext, gameMode],
  )

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
  }

  const winner = calculateWinner(board)
  const isDraw = !winner && board.every((square) => square !== null)

  const renderSquare = (i) => {
    const isWinningSquare = winner?.line.includes(i)
    return (
      <button
        key={i}
        className={`w-20 h-20 border-2 border-gray-400 text-4xl font-bold transition-all duration-200 ${
          isWinningSquare ? "bg-green-200 border-green-500" : "bg-white hover:bg-gray-50"
        } ${board[i] === "X" ? "text-blue-600" : "text-red-600"}`}
        onClick={() => handleClick(i)}
        disabled={board[i] || winner || (gameMode === "ai" && !isXNext)}
      >
        {board[i]}
      </button>
    )
  }

  return (
    <Card className="w-fit mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Tic Tac Toe</CardTitle>
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-2">
            <Button
              variant={gameMode === "human" ? "default" : "outline"}
              onClick={() => {
                setGameMode("human")
                resetGame()
              }}
              size="sm"
            >
              2 Players
            </Button>
            <Button
              variant={gameMode === "ai" ? "default" : "outline"}
              onClick={() => {
                setGameMode("ai")
                resetGame()
              }}
              size="sm"
            >
              vs AI
            </Button>
          </div>

          <div className="flex justify-center gap-4">
            <Badge variant="outline">X: {scores.X}</Badge>
            <Badge variant="outline">O: {scores.O}</Badge>
            <Badge variant="outline">Draws: {scores.draws}</Badge>
          </div>

          {winner && <div className="text-2xl font-bold">🎉 Player {winner.winner} Wins!</div>}
          {isDraw && <div className="text-2xl font-bold text-gray-600">🤝 It's a Draw!</div>}
          {!winner && !isDraw && (
            <div className="text-lg">
              {gameMode === "ai"
                ? isXNext
                  ? "Your turn (X)"
                  : "AI thinking..."
                : `Player ${isXNext ? "X" : "O"}'s turn`}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-1 mx-auto w-fit bg-gray-300 p-2 rounded-lg">
          {Array(9)
            .fill(null)
            .map((_, i) => renderSquare(i))}
        </div>

        <div className="text-center space-y-2">
          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline">
              New Game
            </Button>
            <Button onClick={resetScores} variant="outline">
              Reset Scores
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {gameMode === "ai"
              ? "You are X, AI is O. Get three in a row to win!"
              : "Get three X's or O's in a row to win!"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
