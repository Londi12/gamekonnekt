"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Chess piece types
type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
type PieceColor = "white" | "black"

// Chess piece interface
interface ChessPiece {
  type: PieceType
  color: PieceColor
  hasMoved?: boolean
}

// Position interface
interface Position {
  row: number
  col: number
}

// Move interface
interface Move {
  from: Position
  to: Position
  capturedPiece?: ChessPiece
  isPromotion?: boolean
  isCastling?: boolean
  isEnPassant?: boolean
}

export default function ChessGame() {
  // Game state
  const [board, setBoard] = useState<(ChessPiece | null)[][]>(Array(8).fill(null).map(() => Array(8).fill(null)))
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white")
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [validMoves, setValidMoves] = useState<Position[]>([])
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [gameStatus, setGameStatus] = useState<"active" | "check" | "checkmate" | "stalemate">("active")
  const [promotionPosition, setPromotionPosition] = useState<Position | null>(null)

  // Initialize the game
  useEffect(() => {
    initializeBoard()
  }, [])

  // Initialize the chess board with pieces in starting positions
  const initializeBoard = () => {
    const newBoard: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null))

    // Set up pawns
    for (let col = 0; col < 8; col++) {
      newBoard[1][col] = { type: "pawn", color: "black" }
      newBoard[6][col] = { type: "pawn", color: "white" }
    }

    // Set up rooks
    newBoard[0][0] = { type: "rook", color: "black" }
    newBoard[0][7] = { type: "rook", color: "black" }
    newBoard[7][0] = { type: "rook", color: "white" }
    newBoard[7][7] = { type: "rook", color: "white" }

    // Set up knights
    newBoard[0][1] = { type: "knight", color: "black" }
    newBoard[0][6] = { type: "knight", color: "black" }
    newBoard[7][1] = { type: "knight", color: "white" }
    newBoard[7][6] = { type: "knight", color: "white" }

    // Set up bishops
    newBoard[0][2] = { type: "bishop", color: "black" }
    newBoard[0][5] = { type: "bishop", color: "black" }
    newBoard[7][2] = { type: "bishop", color: "white" }
    newBoard[7][5] = { type: "bishop", color: "white" }

    // Set up queens
    newBoard[0][3] = { type: "queen", color: "black" }
    newBoard[7][3] = { type: "queen", color: "white" }

    // Set up kings
    newBoard[0][4] = { type: "king", color: "black" }
    newBoard[7][4] = { type: "king", color: "white" }

    setBoard(newBoard)
    setCurrentPlayer("white")
    setSelectedPosition(null)
    setValidMoves([])
    setMoveHistory([])
    setGameStatus("active")
    setPromotionPosition(null)
  }

  // Handle square click
  const handleSquareClick = (row: number, col: number) => {
    // If waiting for promotion choice, ignore other clicks
    if (promotionPosition) return

    const clickedPosition = { row, col }
    const piece = board[row][col]

    // If a piece is already selected
    if (selectedPosition) {
      // Check if the clicked position is a valid move
      const isValidMove = validMoves.some(
        move => move.row === row && move.col === col
      )

      if (isValidMove) {
        // Make the move
        makeMove(selectedPosition, clickedPosition)
        setSelectedPosition(null)
        setValidMoves([])
      } else if (piece && piece.color === currentPlayer) {
        // Select a different piece of the same color
        setSelectedPosition(clickedPosition)
        setValidMoves(getValidMovesForPiece(clickedPosition))
      } else {
        // Deselect if clicking on an invalid square
        setSelectedPosition(null)
        setValidMoves([])
      }
    } else if (piece && piece.color === currentPlayer) {
      // Select a piece
      setSelectedPosition(clickedPosition)
      setValidMoves(getValidMovesForPiece(clickedPosition))
    }
  }

  // Make a move
  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row])
    const piece = newBoard[from.row][from.col]
    const capturedPiece = newBoard[to.row][to.col]

    if (!piece) return

    // Check for pawn promotion
    if (piece.type === "pawn" && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col] = piece
      newBoard[from.row][from.col] = null
      setBoard(newBoard)
      setPromotionPosition(to)
      return
    }

    // Check for castling
    let isCastling = false
    if (piece.type === "king" && !piece.hasMoved) {
      // Kingside castling
      if (to.col - from.col === 2) {
        newBoard[from.row][7] = null
        newBoard[from.row][from.col + 1] = { type: "rook", color: piece.color, hasMoved: true }
        isCastling = true
      }
      // Queenside castling
      else if (from.col - to.col === 2) {
        newBoard[from.row][0] = null
        newBoard[from.row][from.col - 1] = { type: "rook", color: piece.color, hasMoved: true }
        isCastling = true
      }
    }

    // Check for en passant
    let isEnPassant = false
    if (
      piece.type === "pawn" &&
      from.col !== to.col &&
      !capturedPiece
    ) {
      newBoard[from.row][to.col] = null
      isEnPassant = true
    }

    // Move the piece
    newBoard[to.row][to.col] = { ...piece, hasMoved: true }
    newBoard[from.row][from.col] = null

    // Record the move
    const move: Move = {
      from,
      to,
      capturedPiece: capturedPiece || undefined,
      isCastling,
      isEnPassant
    }

    setMoveHistory([...moveHistory, move])
    setBoard(newBoard)

    // Switch player
    const nextPlayer = currentPlayer === "white" ? "black" : "white"
    setCurrentPlayer(nextPlayer)

    // Check game status
    updateGameStatus(newBoard, nextPlayer)
  }

  // Promote a pawn
  const promotePawn = (pieceType: PieceType) => {
    if (!promotionPosition) return

    const newBoard = board.map(row => [...row])
    const pawn = newBoard[promotionPosition.row][promotionPosition.col]

    if (pawn && pawn.type === "pawn") {
      newBoard[promotionPosition.row][promotionPosition.col] = {
        type: pieceType,
        color: pawn.color,
        hasMoved: true
      }
    }

    setBoard(newBoard)
    setPromotionPosition(null)

    // Switch player
    const nextPlayer = currentPlayer === "white" ? "black" : "white"
    setCurrentPlayer(nextPlayer)

    // Check game status
    updateGameStatus(newBoard, nextPlayer)
  }

  // Update game status (check, checkmate, stalemate)
  const updateGameStatus = (currentBoard: (ChessPiece | null)[][], player: PieceColor) => {
    const isInCheck = isKingInCheck(currentBoard, player)
    const hasValidMoves = playerHasValidMoves(currentBoard, player)

    if (isInCheck && !hasValidMoves) {
      setGameStatus("checkmate")
    } else if (isInCheck) {
      setGameStatus("check")
    } else if (!hasValidMoves) {
      setGameStatus("stalemate")
    } else {
      setGameStatus("active")
    }
  }

  // Check if the king is in check
  const isKingInCheck = (currentBoard: (ChessPiece | null)[][], player: PieceColor): boolean => {
    // Find the king's position
    let kingPosition: Position | null = null

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col]
        if (piece && piece.type === "king" && piece.color === player) {
          kingPosition = { row, col }
          break
        }
      }
      if (kingPosition) break
    }

    if (!kingPosition) return false

    // Check if any opponent piece can capture the king
    const opponent = player === "white" ? "black" : "white"

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col]
        if (piece && piece.color === opponent) {
          const moves = getPieceMoves({ row, col }, currentBoard, false)
          if (moves.some(move => move.row === kingPosition!.row && move.col === kingPosition!.col)) {
            return true
          }
        }
      }
    }

    return false
  }

  // Check if player has any valid moves
  const playerHasValidMoves = (currentBoard: (ChessPiece | null)[][], player: PieceColor): boolean => {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col]
        if (piece && piece.color === player) {
          const moves = getValidMovesForPiece({ row, col }, currentBoard)
          if (moves.length > 0) {
            return true
          }
        }
      }
    }
    return false
  }

  // Get valid moves for a piece
  const getValidMovesForPiece = (position: Position, currentBoard = board): Position[] => {
    const moves = getPieceMoves(position, currentBoard)

    // Filter out moves that would put or leave the king in check
    return moves.filter(move => {
      const testBoard = currentBoard.map(row => [...row])
      const piece = testBoard[position.row][position.col]

      if (!piece) return false

      // Simulate the move
      testBoard[move.row][move.col] = piece
      testBoard[position.row][position.col] = null

      // Check if the king would be in check after this move
      return !isKingInCheck(testBoard, piece.color)
    })
  }

  // Get all possible moves for a piece without considering check
  const getPieceMoves = (position: Position, currentBoard = board, includeCastling = true): Position[] => {
    const { row, col } = position
    const piece = currentBoard[row][col]

    if (!piece) return []

    const moves: Position[] = []

    switch (piece.type) {
      case "pawn":
        // Direction depends on color
        const direction = piece.color === "white" ? -1 : 1

        // Forward move
        if (
          row + direction >= 0 &&
          row + direction < 8 &&
          !currentBoard[row + direction][col]
        ) {
          moves.push({ row: row + direction, col })

          // Double move from starting position
          if (
            (piece.color === "white" && row === 6) ||
            (piece.color === "black" && row === 1)
          ) {
            if (!currentBoard[row + 2 * direction][col]) {
              moves.push({ row: row + 2 * direction, col })
            }
          }
        }

        // Capture moves
        for (const colOffset of [-1, 1]) {
          if (
            col + colOffset >= 0 &&
            col + colOffset < 8 &&
            row + direction >= 0 &&
            row + direction < 8
          ) {
            const targetPiece = currentBoard[row + direction][col + colOffset]

            // Regular capture
            if (targetPiece && targetPiece.color !== piece.color) {
              moves.push({ row: row + direction, col: col + colOffset })
            }

            // En passant
            else if (
              !targetPiece &&
              moveHistory.length > 0
            ) {
              const lastMove = moveHistory[moveHistory.length - 1]
              const lastPiece = currentBoard[lastMove.to.row][lastMove.to.col]

              if (
                lastPiece &&
                lastPiece.type === "pawn" &&
                lastPiece.color !== piece.color &&
                lastMove.from.row === (piece.color === "white" ? 1 : 6) &&
                lastMove.to.row === row &&
                lastMove.to.col === col + colOffset &&
                Math.abs(lastMove.from.row - lastMove.to.row) === 2
              ) {
                moves.push({ row: row + direction, col: col + colOffset })
              }
            }
          }
        }
        break

      case "rook":
        // Horizontal and vertical moves
        for (const [rowDir, colDir] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * rowDir
            const newCol = col + i * colDir

            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break

            const targetPiece = currentBoard[newRow][newCol]

            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol })
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol })
              }
              break
            }
          }
        }
        break

      case "knight":
        // L-shaped moves
        for (const [rowOffset, colOffset] of [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]) {
          const newRow = row + rowOffset
          const newCol = col + colOffset

          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue

          const targetPiece = currentBoard[newRow][newCol]

          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
        break

      case "bishop":
        // Diagonal moves
        for (const [rowDir, colDir] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * rowDir
            const newCol = col + i * colDir

            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break

            const targetPiece = currentBoard[newRow][newCol]

            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol })
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol })
              }
              break
            }
          }
        }
        break

      case "queen":
        // Combination of rook and bishop moves
        // Horizontal and vertical moves (rook-like)
        for (const [rowDir, colDir] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * rowDir
            const newCol = col + i * colDir

            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break

            const targetPiece = currentBoard[newRow][newCol]

            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol })
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol })
              }
              break
            }
          }
        }

        // Diagonal moves (bishop-like)
        for (const [rowDir, colDir] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          for (let i = 1; i < 8; i++) {
            const newRow = row + i * rowDir
            const newCol = col + i * colDir

            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break

            const targetPiece = currentBoard[newRow][newCol]

            if (!targetPiece) {
              moves.push({ row: newRow, col: newCol })
            } else {
              if (targetPiece.color !== piece.color) {
                moves.push({ row: newRow, col: newCol })
              }
              break
            }
          }
        }
        break

      case "king":
        // One square in any direction
        for (const [rowOffset, colOffset] of [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ]) {
          const newRow = row + rowOffset
          const newCol = col + colOffset

          if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) continue

          const targetPiece = currentBoard[newRow][newCol]

          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }

        // Castling
        if (includeCastling && !piece.hasMoved && !isKingInCheck(currentBoard, piece.color)) {
          // Kingside castling
          const kingsideRook = currentBoard[row][7]
          if (
            kingsideRook &&
            kingsideRook.type === "rook" &&
            kingsideRook.color === piece.color &&
            !kingsideRook.hasMoved &&
            !currentBoard[row][5] &&
            !currentBoard[row][6] &&
            !isSquareAttacked({ row, col: 5 }, piece.color, currentBoard) &&
            !isSquareAttacked({ row, col: 6 }, piece.color, currentBoard)
          ) {
            moves.push({ row, col: 6 })
          }

          // Queenside castling
          const queensideRook = currentBoard[row][0]
          if (
            queensideRook &&
            queensideRook.type === "rook" &&
            queensideRook.color === piece.color &&
            !queensideRook.hasMoved &&
            !currentBoard[row][1] &&
            !currentBoard[row][2] &&
            !currentBoard[row][3] &&
            !isSquareAttacked({ row, col: 2 }, piece.color, currentBoard) &&
            !isSquareAttacked({ row, col: 3 }, piece.color, currentBoard)
          ) {
            moves.push({ row, col: 2 })
          }
        }
        break
    }

    return moves
  }

  // Check if a square is under attack by the opponent
  const isSquareAttacked = (position: Position, playerColor: PieceColor, currentBoard = board): boolean => {
    const opponentColor = playerColor === "white" ? "black" : "white"

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = currentBoard[row][col]
        if (piece && piece.color === opponentColor) {
          // For efficiency, we use a simplified version that doesn't consider castling
          const moves = getPieceMoves({ row, col }, currentBoard, false)
          if (moves.some(move => move.row === position.row && move.col === position.col)) {
            return true
          }
        }
      }
    }

    return false
  }

  // Render a chess piece
  const renderPiece = (piece: ChessPiece | null) => {
    if (!piece) return null

    const pieceSymbols = {
      white: {
        king: "♔",
        queen: "♕",
        rook: "♖",
        bishop: "♗",
        knight: "♘",
        pawn: "♙"
      },
      black: {
        king: "♚",
        queen: "♛",
        rook: "♜",
        bishop: "♝",
        knight: "♞",
        pawn: "♟"
      }
    }

    return (
      <span className={`text-xl sm:text-2xl md:text-3xl ${piece.color === "white" ? "text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]" : "text-black"}`}>
        {pieceSymbols[piece.color][piece.type]}
      </span>
    )
  }

  // Render the promotion selection UI
  const renderPromotionSelection = () => {
    if (!promotionPosition) return null

    const promotionPieces: PieceType[] = ["queen", "rook", "bishop", "knight"]
    const pieceColor = currentPlayer === "white" ? "black" : "white"

    return (
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-bold mb-2">Choose promotion:</h3>
          <div className="flex gap-4">
            {promotionPieces.map(type => (
              <button
                key={type}
                className="w-16 h-16 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded"
                onClick={() => promotePawn(type)}
              >
                <span className="text-3xl">
                  {type === "queen" ? (pieceColor === "white" ? "♕" : "♛") :
                   type === "rook" ? (pieceColor === "white" ? "♖" : "♜") :
                   type === "bishop" ? (pieceColor === "white" ? "♗" : "♝") :
                   (pieceColor === "white" ? "♘" : "♞")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render the game status message
  const renderGameStatus = () => {
    switch (gameStatus) {
      case "check":
        return <Badge variant="destructive">{currentPlayer === "white" ? "White" : "Black"} is in check!</Badge>
      case "checkmate":
        return <Badge variant="destructive">Checkmate! {currentPlayer === "white" ? "Black" : "White"} wins!</Badge>
      case "stalemate":
        return <Badge variant="secondary">Stalemate! The game is a draw.</Badge>
      default:
        return <Badge variant="outline">{currentPlayer === "white" ? "White" : "Black"} to move</Badge>
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto relative">
      <CardHeader>
        <CardTitle className="text-center">Chess</CardTitle>
        <div className="flex justify-between items-center">
          {renderGameStatus()}
          <Button size="sm" onClick={initializeBoard}>New Game</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-0 border-2 border-gray-800 w-fit mx-auto">
          {board.map((row, rowIndex) => (
            row.map((piece, colIndex) => {
              const isSelected = selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex
              const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex)
              const isLight = (rowIndex + colIndex) % 2 === 0

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 flex items-center justify-center relative
                    ${isLight ? "bg-amber-100" : "bg-amber-800"}
                    ${isSelected ? "ring-2 ring-blue-500 ring-inset animate-pulse-highlight" : ""}
                    ${isValidMove ? "cursor-pointer hover:bg-blue-200 hover:bg-opacity-30" : ""}`}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece && renderPiece(piece)}

                  {/* Highlight for valid moves */}
                  {isValidMove && (
                    <div className={`absolute inset-0 bg-blue-500 bg-opacity-30 rounded-full m-4 ${piece ? "ring-1 ring-blue-500" : ""}`} />
                  )}

                  {/* Coordinate labels */}
                  {colIndex === 0 && (
                    <span className="absolute left-0.5 top-0.5 text-xs font-bold text-gray-600">
                      {8 - rowIndex}
                    </span>
                  )}
                  {rowIndex === 7 && (
                    <span className="absolute right-0.5 bottom-0.5 text-xs font-bold text-gray-600">
                      {String.fromCharCode(97 + colIndex)}
                    </span>
                  )}
                </div>
              )
            })
          ))}
        </div>

        {/* Move history */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Move History</h3>
          <div className="h-32 overflow-y-auto border rounded p-2 text-sm">
            {moveHistory.length === 0 ? (
              <p className="text-gray-500">No moves yet</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                  <div key={i} className="contents">
                    <div className="flex items-center">
                      <span className="w-6 text-gray-500">{i + 1}.</span>
                      <span>
                        {`${String.fromCharCode(97 + moveHistory[i * 2].from.col)}${8 - moveHistory[i * 2].from.row}→${String.fromCharCode(97 + moveHistory[i * 2].to.col)}${8 - moveHistory[i * 2].to.row}`}
                      </span>
                    </div>
                    {moveHistory[i * 2 + 1] && (
                      <div>
                        {`${String.fromCharCode(97 + moveHistory[i * 2 + 1].from.col)}${8 - moveHistory[i * 2 + 1].from.row}→${String.fromCharCode(97 + moveHistory[i * 2 + 1].to.col)}${8 - moveHistory[i * 2 + 1].to.row}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Promotion selection UI */}
        {renderPromotionSelection()}
      </CardContent>
    </Card>
  )
}
