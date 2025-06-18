"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Star, Download, Users, Share2 } from "lucide-react"
import TetrisGame from "@/components/games/tetris-game"
import Game2048 from "@/components/games/2048-game"
import SnakeGame from "@/components/games/snake-game"
import MemoryGame from "@/components/games/memory-game"
import FlappyBirdGame from "@/components/games/flappy-bird-game"
import WordleGame from "@/components/games/wordle-game"
import MinesweeperGame from "@/components/games/minesweeper-game"
import TypingSpeedGame from "@/components/games/typing-speed-game"
import BreakoutGame from "@/components/games/breakout-game"
import SudokuGame from "@/components/games/sudoku-game"
import TicTacToeGame from "@/components/games/tic-tac-toe-game"
import HangmanGame from "@/components/games/hangman-game"
// New game imports would go here when implemented
// import PacmanGame from "@/components/games/pacman-game"
import ChessGame from "@/components/games/chess-game"
// import ConnectFourGame from "@/components/games/connect-four-game"
// import SimonGame from "@/components/games/simon-game"
// import PongGame from "@/components/games/pong-game"
// import CrosswordGame from "@/components/games/crossword-game"
// import MahjongGame from "@/components/games/mahjong-game"
import SolitaireGame from "@/components/games/solitaire-game"
import BattleshipGame from "@/components/games/battleship-game"
import CandyMatchGame from "@/components/games/candy-match-game"

const games = [
  {
    id: "tetris",
    title: "Tetris",
    description: "Classic block-stacking puzzle game",
    category: "Puzzle",
    rating: 4.8,
    downloads: "10M+",
    color: "bg-blue-500",
    component: TetrisGame,
  },
  {
    id: "2048",
    title: "2048",
    description: "Slide tiles to reach 2048",
    category: "Puzzle",
    rating: 4.6,
    downloads: "5M+",
    color: "bg-orange-500",
    component: Game2048,
  },
  {
    id: "snake",
    title: "Snake",
    description: "Eat food and grow longer",
    category: "Arcade",
    rating: 4.7,
    downloads: "8M+",
    color: "bg-green-500",
    component: SnakeGame,
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Find matching pairs of cards",
    category: "Puzzle",
    rating: 4.5,
    downloads: "3M+",
    color: "bg-purple-500",
    component: MemoryGame,
  },
  {
    id: "flappy",
    title: "Flappy Bird",
    description: "Navigate through pipes",
    category: "Arcade",
    rating: 4.3,
    downloads: "15M+",
    color: "bg-yellow-500",
    component: FlappyBirdGame,
  },
  {
    id: "wordle",
    title: "Wordle",
    description: "Guess the 5-letter word in 6 tries",
    category: "Puzzle",
    rating: 4.9,
    downloads: "20M+",
    color: "bg-emerald-500",
    component: WordleGame,
  },
  {
    id: "minesweeper",
    title: "Minesweeper",
    description: "Clear the field without hitting mines",
    category: "Puzzle",
    rating: 4.4,
    downloads: "12M+",
    color: "bg-red-500",
    component: MinesweeperGame,
  },
  {
    id: "typing",
    title: "Typing Speed Test",
    description: "Test your typing speed and accuracy",
    category: "Educational",
    rating: 4.6,
    downloads: "7M+",
    color: "bg-indigo-500",
    component: TypingSpeedGame,
  },
  {
    id: "breakout",
    title: "Breakout",
    description: "Break bricks with a bouncing ball",
    category: "Arcade",
    rating: 4.5,
    downloads: "9M+",
    color: "bg-pink-500",
    component: BreakoutGame,
  },
  {
    id: "sudoku",
    title: "Sudoku",
    description: "Fill the grid with numbers 1-9",
    category: "Puzzle",
    rating: 4.7,
    downloads: "6M+",
    color: "bg-teal-500",
    component: SudokuGame,
  },
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    description: "Classic X's and O's game",
    category: "Strategy",
    rating: 4.2,
    downloads: "4M+",
    color: "bg-cyan-500",
    component: TicTacToeGame,
  },
  {
    id: "hangman",
    title: "Hangman",
    description: "Guess the word before time runs out",
    category: "Word",
    rating: 4.3,
    downloads: "8M+",
    color: "bg-violet-600",
    component: HangmanGame,
  },
  // New games that could be added:
  /*
  {
    id: "pacman",
    title: "Pac-Man",
    description: "Navigate maze, eat dots, avoid ghosts",
    category: "Arcade",
    rating: 4.9,
    downloads: "25M+",
    color: "bg-yellow-400",
    component: PacmanGame,
  },
  */
  {
    id: "chess",
    title: "Chess",
    description: "Classic strategy board game",
    category: "Strategy",
    rating: 4.7,
    downloads: "15M+",
    color: "bg-slate-700",
    component: ChessGame,
  },
  /*
  {
    id: "connect-four",
    title: "Connect Four",
    description: "Drop discs to connect four in a row",
    category: "Strategy",
    rating: 4.5,
    downloads: "7M+",
    color: "bg-blue-600",
    component: ConnectFourGame,
  },
  {
    id: "simon",
    title: "Simon",
    description: "Repeat the pattern of lights and sounds",
    category: "Memory",
    rating: 4.4,
    downloads: "5M+",
    color: "bg-green-600",
    component: SimonGame,
  },
  {
    id: "pong",
    title: "Pong",
    description: "Classic table tennis arcade game",
    category: "Arcade",
    rating: 4.1,
    downloads: "6M+",
    color: "bg-gray-800",
    component: PongGame,
  },
  {
    id: "crossword",
    title: "Crossword",
    description: "Fill in words from clues in a grid",
    category: "Word",
    rating: 4.6,
    downloads: "9M+",
    color: "bg-amber-700",
    component: CrosswordGame,
  },
  {
    id: "mahjong",
    title: "Mahjong Solitaire",
    description: "Match pairs of tiles to clear the board",
    category: "Puzzle",
    rating: 4.5,
    downloads: "10M+",
    color: "bg-red-700",
    component: MahjongGame,
  },
  */
  {
    id: "solitaire",
    title: "Solitaire",
    description: "Classic card game of patience",
    category: "Card",
    rating: 4.8,
    downloads: "30M+",
    color: "bg-emerald-700",
    component: SolitaireGame,
  },
  {
    id: "battleship",
    title: "Battleship",
    description: "Sink your opponent's fleet of ships",
    category: "Strategy",
    rating: 4.4,
    downloads: "8M+",
    color: "bg-blue-800",
    component: BattleshipGame,
  },
  {
    id: "candymatch",
    title: "Candy Match",
    description: "Match 3 or more candies in a row",
    category: "Puzzle",
    rating: 4.6,
    downloads: "20M+",
    color: "bg-pink-400",
    component: CandyMatchGame,
  }
]

export default function GameKonnekt() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const currentGame = games.find((game) => game.id === selectedGame)

  const downloadGame = (game) => {
    // Create a simple HTML file with the game
    const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${game.title} - GameKonnekt</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
        }
        .logo { font-size: 2.5em; margin-bottom: 10px; font-weight: bold; }
        .game-title { font-size: 2em; margin: 20px 0; }
        .description { font-size: 1.2em; margin-bottom: 30px; opacity: 0.9; }
        .play-button { 
            background: #4CAF50; 
            color: white; 
            padding: 15px 30px; 
            border: none; 
            border-radius: 25px; 
            font-size: 1.2em; 
            cursor: pointer;
            transition: all 0.3s;
        }
        .play-button:hover { 
            background: #45a049; 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .footer { margin-top: 40px; opacity: 0.7; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎮 GameKonnekt</div>
        <div class="game-title">${game.title}</div>
        <div class="description">${game.description}</div>
        <button class="play-button" onclick="alert('Visit GameKonnekt online to play this game!')">
            🎮 Play ${game.title}
        </button>
        <div class="footer">
            <p>Downloaded from GameKonnekt</p>
            <p>Visit us online for the full gaming experience!</p>
        </div>
    </div>
</body>
</html>
    `

    const blob = new Blob([gameHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${game.title.replace(/\s+/g, "-").toLowerCase()}-gamekonnekt.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (selectedGame && currentGame) {
    const GameComponent = currentGame.component
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedGame(null)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to GameKonnekt
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => downloadGame(currentGame)} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-bold mb-2 text-white">{currentGame.title}</h1>
            <p className="text-xl text-gray-200">{currentGame.description}</p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {currentGame.category}
              </Badge>
              <div className="flex items-center gap-1 text-white">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg font-semibold">{currentGame.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-white">
                <Download className="w-5 h-5" />
                <span className="text-lg">{currentGame.downloads}</span>
              </div>
            </div>
          </div>
          <GameComponent />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-white">
            🎮 Game<span className="text-yellow-400">Konnekt</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-6">Connect. Play. Download. Enjoy!</p>
          <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto">
            Your ultimate destination for classic games - play online or download to play offline
          </p>
        </div>

        <div id="games" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20"
            >
              <CardHeader className="pb-3">
                <div className={`w-16 h-16 rounded-xl ${game.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Play className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl text-white">{game.title}</CardTitle>
                <CardDescription className="text-gray-200">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {game.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-200">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {game.rating}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-200">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {game.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Everyone
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    onClick={() => setSelectedGame(game.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => downloadGame(game)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div id="about" className="mt-16 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold mb-4 text-white">Why Choose GameKonnekt?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="space-y-2">
              <div className="text-4xl">🎮</div>
              <h3 className="text-xl font-semibold">Play Instantly</h3>
              <p className="text-gray-200">No downloads required - play directly in your browser</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">📱</div>
              <h3 className="text-xl font-semibold">Download & Play Offline</h3>
              <p className="text-gray-200">Download games to play anytime, anywhere</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🏆</div>
              <h3 className="text-xl font-semibold">Classic Games</h3>
              <p className="text-gray-200">Carefully crafted versions of your favorite games</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
