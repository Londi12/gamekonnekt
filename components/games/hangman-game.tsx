"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, Trophy, Skull, Brain, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

// Word list for the game
const WORDS = [
  "REACT", "JAVASCRIPT", "TYPESCRIPT", "NEXTJS", "TAILWIND",
  "COMPONENT", "FUNCTION", "VARIABLE", "INTERFACE", "PROMISE",
  "ASYNC", "AWAIT", "ROUTER", "STATE", "PROPS",
  "HOOK", "EFFECT", "CONTEXT", "REDUCER", "MIDDLEWARE",
  "SERVER", "CLIENT", "RENDER", "COMPILE", "BUNDLE",
  "DEPLOY", "VERCEL", "NETLIFY", "GITHUB", "GITLAB"
]

// Maximum number of incorrect guesses allowed
const MAX_ATTEMPTS = 6

// Keyboard layout
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"]
]

export default function HangmanGame() {
  const [word, setWord] = useState("")
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set())
  const [incorrectGuesses, setIncorrectGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")

  // Initialize the game
  const initGame = useCallback(() => {
    // Select a random word based on difficulty
    let wordPool = WORDS
    if (difficulty === "easy") {
      wordPool = WORDS.filter(w => w.length <= 5)
    } else if (difficulty === "hard") {
      wordPool = WORDS.filter(w => w.length >= 8)
    }

    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)]
    setWord(randomWord)
    setGuessedLetters(new Set())
    setIncorrectGuesses(0)
    setGameStatus("playing")
  }, [difficulty])

  // Initialize on first render and when difficulty changes
  useEffect(() => {
    initGame()

    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("hangman-high-score")
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [initGame])

  // Save high score to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("hangman-high-score", highScore.toString())
  }, [highScore])

  // Handle letter guess
  const handleGuess = (letter: string) => {
    if (gameStatus !== "playing" || guessedLetters.has(letter)) {
      return
    }

    const newGuessedLetters = new Set(guessedLetters)
    newGuessedLetters.add(letter)
    setGuessedLetters(newGuessedLetters)

    if (!word.includes(letter)) {
      const newIncorrectGuesses = incorrectGuesses + 1
      setIncorrectGuesses(newIncorrectGuesses)

      if (newIncorrectGuesses >= MAX_ATTEMPTS) {
        setGameStatus("lost")
      }
    } else {
      // Check if all letters in the word have been guessed
      const allLettersGuessed = [...word].every(char => newGuessedLetters.has(char))
      if (allLettersGuessed) {
        const newScore = calculateScore()
        setScore(prevScore => prevScore + newScore)
        setHighScore(prevHighScore => Math.max(prevHighScore, score + newScore))
        setGameStatus("won")
      }
    }
  }

  // Calculate score based on word length, difficulty, and remaining attempts
  const calculateScore = () => {
    const baseScore = word.length * 10
    const difficultyMultiplier = difficulty === "easy" ? 1 : difficulty === "medium" ? 1.5 : 2
    const attemptsBonus = (MAX_ATTEMPTS - incorrectGuesses) * 5
    return Math.floor((baseScore + attemptsBonus) * difficultyMultiplier)
  }

  // Restart the game
  const restartGame = () => {
    initGame()
  }

  // Change difficulty
  const changeDifficulty = (newDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(newDifficulty)
  }

  // Render the word with guessed letters revealed
  const renderWord = () => {
    return (
      <div className="flex justify-center flex-wrap gap-2">
        {word.split("").map((letter, index) => {
          const isRevealed = guessedLetters.has(letter) || gameStatus === "lost";
          const isLastRevealed = isRevealed && 
            [...guessedLetters].indexOf(letter) === [...guessedLetters].length - 1 && 
            gameStatus === "playing";

          return (
            <motion.div 
              key={index} 
              className={`w-10 h-12 rounded-md flex items-center justify-center
                ${isRevealed ? 'bg-gradient-to-br from-violet-500 to-purple-700' : 'bg-transparent'} 
                border-b-2 border-purple-300 shadow-md`}
              initial={{ y: 0 }}
              animate={{ 
                y: isLastRevealed ? [0, -10, 0] : 0,
                scale: isLastRevealed ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {isRevealed ? (
                  <motion.span 
                    key="revealed"
                    className="text-2xl font-bold text-white"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {letter}
                  </motion.span>
                ) : (
                  <motion.span 
                    key="hidden"
                    className="text-xl text-purple-300/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    •
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Render the hangman figure
  const renderHangman = () => {
    return (
      <div className="w-60 h-60 relative mx-auto">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 200 200" 
          className="drop-shadow-lg"
        >
          {/* Gallows - always visible with gradient */}
          <g>
            {/* Base */}
            <motion.line 
              x1="20" y1="180" x2="180" y2="180" 
              strokeWidth="4" 
              stroke="url(#gallowsGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            />

            {/* Vertical pole */}
            <motion.line 
              x1="40" y1="180" x2="40" y2="20" 
              strokeWidth="4" 
              stroke="url(#gallowsGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />

            {/* Horizontal beam */}
            <motion.line 
              x1="40" y1="20" x2="120" y2="20" 
              strokeWidth="4" 
              stroke="url(#gallowsGradient)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />

            {/* Rope */}
            <motion.line 
              x1="120" y1="20" x2="120" y2="40" 
              strokeWidth="3" 
              stroke="url(#ropeGradient)"
              strokeDasharray="2,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            />
          </g>

          {/* Hangman parts - appear based on incorrect guesses */}

          {/* Head */}
          <AnimatePresence>
            {incorrectGuesses >= 1 && (
              <motion.circle 
                cx="120" cy="55" r="15" 
                fill="none" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </AnimatePresence>

          {/* Body */}
          <AnimatePresence>
            {incorrectGuesses >= 2 && (
              <motion.line 
                x1="120" y1="70" x2="120" y2="120" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Left arm */}
          <AnimatePresence>
            {incorrectGuesses >= 3 && (
              <motion.line 
                x1="120" y1="80" x2="90" y2="100" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Right arm */}
          <AnimatePresence>
            {incorrectGuesses >= 4 && (
              <motion.line 
                x1="120" y1="80" x2="150" y2="100" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Left leg */}
          <AnimatePresence>
            {incorrectGuesses >= 5 && (
              <motion.line 
                x1="120" y1="120" x2="90" y2="150" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Right leg */}
          <AnimatePresence>
            {incorrectGuesses >= 6 && (
              <motion.line 
                x1="120" y1="120" x2="150" y2="150" 
                strokeWidth="3" 
                stroke="url(#bodyGradient)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>

          {/* Face - only appears when game is lost */}
          <AnimatePresence>
            {gameStatus === "lost" && (
              <>
                {/* X eyes */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <line x1="112" y1="50" x2="118" y2="56" stroke="#ff5555" strokeWidth="2" />
                  <line x1="118" y1="50" x2="112" y2="56" stroke="#ff5555" strokeWidth="2" />
                  <line x1="122" y1="50" x2="128" y2="56" stroke="#ff5555" strokeWidth="2" />
                  <line x1="128" y1="50" x2="122" y2="56" stroke="#ff5555" strokeWidth="2" />
                  <path d="M 110 65 Q 120 60 130 65" stroke="#ff5555" strokeWidth="2" fill="none" />
                </motion.g>
              </>
            )}
          </AnimatePresence>

          {/* Gradients */}
          <defs>
            <linearGradient id="gallowsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B4513" />
              <stop offset="100%" stopColor="#5D2906" />
            </linearGradient>
            <linearGradient id="ropeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D2B48C" />
              <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#d4d4d4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Game status indicator */}
        <AnimatePresence>
          {gameStatus === "won" && (
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/80 rounded-full p-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: [0, 10, -10, 0] }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Render the keyboard
  const renderKeyboard = () => {
    return (
      <div className="mt-6">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <motion.div 
            key={rowIndex} 
            className="flex justify-center my-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * rowIndex, duration: 0.3 }}
          >
            {row.map((letter, letterIndex) => {
              const isGuessed = guessedLetters.has(letter)
              const isCorrect = word.includes(letter) && isGuessed

              let buttonStyle = "";
              if (isGuessed) {
                if (isCorrect) {
                  buttonStyle = "bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-green-500/30 text-white";
                } else {
                  buttonStyle = "bg-gradient-to-br from-red-400 to-red-600 border-red-300 shadow-red-500/30 text-white";
                }
              } else {
                buttonStyle = "bg-gradient-to-br from-gray-700 to-gray-900 border-gray-600 hover:from-violet-500 hover:to-purple-700 shadow-lg";
              }

              return (
                <motion.div
                  key={letter}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.05 * letterIndex + 0.1 * rowIndex,
                    duration: 0.2,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={!isGuessed && gameStatus === "playing" ? { scale: 1.1 } : {}}
                  whileTap={!isGuessed && gameStatus === "playing" ? { scale: 0.95 } : {}}
                >
                  <Button
                    variant="outline"
                    className={`m-1 w-10 h-12 p-0 text-lg font-bold rounded-md border ${buttonStyle}`}
                    onClick={() => handleGuess(letter)}
                    disabled={isGuessed || gameStatus !== "playing"}
                  >
                    {letter}
                  </Button>
                </motion.div>
              )
            })}
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <CardHeader className="pb-2 border-b border-purple-700/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
            HANGMAN
          </CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant="outline"
              className={`cursor-pointer transition-all duration-300 ${
                difficulty === "easy" 
                  ? "bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30" 
                  : "hover:bg-green-500/10 hover:text-green-300 hover:border-green-400/20"
              }`}
              onClick={() => changeDifficulty("easy")}
            >
              Easy
            </Badge>
            <Badge 
              variant="outline"
              className={`cursor-pointer transition-all duration-300 ${
                difficulty === "medium" 
                  ? "bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30" 
                  : "hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-400/20"
              }`}
              onClick={() => changeDifficulty("medium")}
            >
              Medium
            </Badge>
            <Badge 
              variant="outline"
              className={`cursor-pointer transition-all duration-300 ${
                difficulty === "hard" 
                  ? "bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30" 
                  : "hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/20"
              }`}
              onClick={() => changeDifficulty("hard")}
            >
              Hard
            </Badge>
          </div>
        </div>
        <CardDescription className="text-gray-400 mt-1">
          Guess the word before the hangman is complete. You have {MAX_ATTEMPTS} attempts.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Hangman figure */}
          <div className="flex flex-col items-center lg:col-span-1">
            <div className="bg-gray-800/60 rounded-lg p-4 w-full">
              {renderHangman()}
              <div className="mt-2 text-center">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                  Incorrect: {incorrectGuesses}/{MAX_ATTEMPTS}
                </Badge>
              </div>
            </div>
          </div>

          {/* Middle and right panel - Word display and stats */}
          <div className="flex flex-col lg:col-span-2">
            <div className="bg-gray-800/60 rounded-lg p-6 mb-6">
              <div className="mb-6">
                {renderWord()}
              </div>

              <AnimatePresence mode="wait">
                {gameStatus === "won" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-green-700/50 mb-4 shadow-lg">
                      <Trophy className="h-5 w-5 text-green-400" />
                      <AlertTitle className="text-green-300 font-bold">Victory!</AlertTitle>
                      <AlertDescription className="text-green-200">
                        Congratulations! You guessed <span className="font-bold">{word}</span>. 
                        <span className="block mt-1 text-green-300 font-semibold">Score: +{calculateScore()} points</span>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {gameStatus === "lost" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-gradient-to-r from-red-900/80 to-rose-900/80 border-red-700/50 mb-4 shadow-lg">
                      <Skull className="h-5 w-5 text-red-400" />
                      <AlertTitle className="text-red-300 font-bold">Game Over</AlertTitle>
                      <AlertDescription className="text-red-200">
                        The word was: <span className="font-bold text-white">{word}</span>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-gray-800/80 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-gray-400 mb-1">SCORE</p>
                  <motion.p 
                    className="text-2xl font-bold text-white"
                    key={score}
                    initial={{ scale: 1.5, color: "#a855f7" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    transition={{ duration: 0.5 }}
                  >
                    {score}
                  </motion.p>
                </div>
                <div className="bg-gray-800/80 rounded-lg p-3 text-center">
                  <p className="text-xs font-semibold text-gray-400 mb-1">HIGH SCORE</p>
                  <p className="text-2xl font-bold text-amber-400">{highScore}</p>
                </div>
              </div>
            </div>

            {/* Game hints */}
            <div className="bg-gray-800/40 rounded-lg p-3 mb-6 flex items-center gap-3">
              <Brain className="h-5 w-5 text-purple-400" />
              <div className="text-sm text-gray-300">
                <span className="font-semibold text-purple-300">Hint:</span> The word is related to programming or web development.
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard */}
        <div className="bg-gray-800/40 rounded-lg p-4 mt-2">
          {renderKeyboard()}

          {gameStatus !== "playing" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
                onClick={restartGame}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Play Again
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between text-sm text-gray-400 border-t border-purple-700/30 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <p>Use keyboard or click letters to guess</p>
        </div>
        <p>GameKonnekt © 2025</p>
      </CardFooter>
    </Card>
  )
}
