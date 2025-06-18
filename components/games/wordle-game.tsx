"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RotateCcw, Share2, Info, HelpCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Common 5-letter words for the game
const WORD_LIST = [
  "ABOUT",
  "ABOVE",
  "ABUSE",
  "ACTOR",
  "ACUTE",
  "ADMIT",
  "ADOPT",
  "ADULT",
  "AFTER",
  "AGAIN",
  "AGENT",
  "AGREE",
  "AHEAD",
  "ALARM",
  "ALBUM",
  "ALERT",
  "ALIEN",
  "ALIGN",
  "ALIKE",
  "ALIVE",
  "ALLOW",
  "ALONE",
  "ALONG",
  "ALTER",
  "ANGEL",
  "ANGER",
  "ANGLE",
  "ANGRY",
  "APART",
  "APPLE",
  "APPLY",
  "ARENA",
  "ARGUE",
  "ARISE",
  "ARRAY",
  "ASIDE",
  "ASSET",
  "AUDIO",
  "AUDIT",
  "AVOID",
  "AWAKE",
  "AWARD",
  "AWARE",
  "BADLY",
  "BAKER",
  "BASES",
  "BASIC",
  "BEACH",
  "BEGAN",
  "BEGIN",
  "BEING",
  "BELOW",
  "BENCH",
  "BILLY",
  "BIRTH",
  "BLACK",
  "BLAME",
  "BLANK",
  "BLIND",
  "BLOCK",
  "BLOOD",
  "BOARD",
  "BOOST",
  "BOOTH",
  "BOUND",
  "BRAIN",
  "BRAND",
  "BRAVE",
  "BREAD",
  "BREAK",
  "BREED",
  "BRIEF",
  "BRING",
  "BROAD",
  "BROKE",
  "BROWN",
  "BUILD",
  "BUILT",
  "BUYER",
  "CABLE",
  "CALIF",
  "CARRY",
  "CATCH",
  "CAUSE",
  "CHAIN",
  "CHAIR",
  "CHAOS",
  "CHARM",
  "CHART",
  "CHASE",
  "CHEAP",
  "CHECK",
  "CHEST",
  "CHIEF",
  "CHILD",
  "CHINA",
  "CHOSE",
  "CIVIL",
  "CLAIM",
  "CLASS",
  "CLEAN",
  "CLEAR",
  "CLICK",
  "CLIMB",
  "CLOCK",
  "CLOSE",
  "CLOUD",
  "COACH",
  "COAST",
  "COULD",
  "COUNT",
  "COURT",
  "COVER",
  "CRAFT",
  "CRASH",
  "CRAZY",
  "CREAM",
  "CRIME",
  "CROSS",
  "CROWD",
  "CROWN",
  "CRUDE",
  "CURVE",
  "CYCLE",
  "DAILY",
  "DANCE",
  "DATED",
  "DEALT",
  "DEATH",
  "DEBUT",
  "DELAY",
  "DEPTH",
  "DOING",
  "DOUBT",
  "DOZEN",
  "DRAFT",
  "DRAMA",
  "DRANK",
  "DREAM",
  "DRESS",
  "DRILL",
  "DRINK",
  "DRIVE",
  "DROVE",
  "DYING",
  "EAGER",
  "EARLY",
  "EARTH",
  "EIGHT",
  "ELITE",
  "EMPTY",
  "ENEMY",
  "ENJOY",
  "ENTER",
  "ENTRY",
  "EQUAL",
  "ERROR",
  "EVENT",
  "EVERY",
  "EXACT",
  "EXIST",
  "EXTRA",
  "FAITH",
  "FALSE",
  "FAULT",
  "FIBER",
  "FIELD",
  "FIFTH",
  "FIFTY",
  "FIGHT",
  "FINAL",
  "FIRST",
  "FIXED",
  "FLASH",
  "FLEET",
  "FLOOR",
  "FLUID",
  "FOCUS",
  "FORCE",
  "FORTH",
  "FORTY",
  "FORUM",
  "FOUND",
  "FRAME",
  "FRANK",
  "FRAUD",
  "FRESH",
  "FRONT",
  "FRUIT",
  "FULLY",
  "FUNNY",
  "GIANT",
  "GIVEN",
  "GLASS",
  "GLOBE",
  "GOING",
  "GRACE",
  "GRADE",
  "GRAND",
  "GRANT",
  "GRASS",
  "GRAVE",
  "GREAT",
  "GREEN",
  "GROSS",
  "GROUP",
  "GROWN",
  "GUARD",
  "GUESS",
  "GUEST",
  "GUIDE",
  "HAPPY",
  "HARRY",
  "HEART",
  "HEAVY",
  "HENCE",
  "HENRY",
  "HORSE",
  "HOTEL",
  "HOUSE",
  "HUMAN",
  "IDEAL",
  "IMAGE",
  "INDEX",
  "INNER",
  "INPUT",
  "ISSUE",
  "JAPAN",
  "JIMMY",
  "JOINT",
  "JONES",
  "JUDGE",
  "KNOWN",
  "LABEL",
  "LARGE",
  "LASER",
  "LATER",
  "LAUGH",
  "LAYER",
  "LEARN",
  "LEASE",
  "LEAST",
  "LEAVE",
  "LEGAL",
  "LEVEL",
  "LEWIS",
  "LIGHT",
  "LIMIT",
  "LINKS",
  "LIVES",
  "LOCAL",
  "LOOSE",
  "LOWER",
  "LUCKY",
  "LUNCH",
  "LYING",
  "MAGIC",
  "MAJOR",
  "MAKER",
  "MARCH",
  "MARIA",
  "MATCH",
  "MAYBE",
  "MAYOR",
  "MEANT",
  "MEDIA",
  "METAL",
  "MIGHT",
  "MINOR",
  "MINUS",
  "MIXED",
  "MODEL",
  "MONEY",
  "MONTH",
  "MORAL",
  "MOTOR",
  "MOUNT",
  "MOUSE",
  "MOUTH",
  "MOVED",
  "MOVIE",
  "MUSIC",
  "NEEDS",
  "NEVER",
  "NEWLY",
  "NIGHT",
  "NOISE",
  "NORTH",
  "NOTED",
  "NOVEL",
  "NURSE",
  "OCCUR",
  "OCEAN",
  "OFFER",
  "OFTEN",
  "ORDER",
  "OTHER",
  "OUGHT",
  "PAINT",
  "PANEL",
  "PAPER",
  "PARTY",
  "PEACE",
  "PETER",
  "PHASE",
  "PHONE",
  "PHOTO",
  "PIANO",
  "PIECE",
  "PILOT",
  "PITCH",
  "PLACE",
  "PLAIN",
  "PLANE",
  "PLANT",
  "PLATE",
  "POINT",
  "POUND",
  "POWER",
  "PRESS",
  "PRICE",
  "PRIDE",
  "PRIME",
  "PRINT",
  "PRIOR",
  "PRIZE",
  "PROOF",
  "PROUD",
  "PROVE",
  "QUEEN",
  "QUICK",
  "QUIET",
  "QUITE",
  "RADIO",
  "RAISE",
  "RANGE",
  "RAPID",
  "RATIO",
  "REACH",
  "READY",
  "REALM",
  "REBEL",
  "REFER",
  "RELAX",
  "REPAY",
  "REPLY",
  "RIGHT",
  "RIGID",
  "RIVAL",
  "RIVER",
  "ROBIN",
  "ROGER",
  "ROMAN",
  "ROUGH",
  "ROUND",
  "ROUTE",
  "ROYAL",
  "RURAL",
  "SCALE",
  "SCENE",
  "SCOPE",
  "SCORE",
  "SENSE",
  "SERVE",
  "SEVEN",
  "SHALL",
  "SHAPE",
  "SHARE",
  "SHARP",
  "SHEET",
  "SHELF",
  "SHELL",
  "SHIFT",
  "SHINE",
  "SHIRT",
  "SHOCK",
  "SHOOT",
  "SHORT",
  "SHOWN",
  "SIGHT",
  "SILLY",
  "SINCE",
  "SIXTH",
  "SIXTY",
  "SIZED",
  "SKILL",
  "SLEEP",
  "SLIDE",
  "SMALL",
  "SMART",
  "SMILE",
  "SMITH",
  "SMOKE",
  "SOLID",
  "SOLVE",
  "SORRY",
  "SOUND",
  "SOUTH",
  "SPACE",
  "SPARE",
  "SPEAK",
  "SPEED",
  "SPEND",
  "SPENT",
  "SPLIT",
  "SPOKE",
  "SPORT",
  "STAFF",
  "STAGE",
  "STAKE",
  "STAND",
  "START",
  "STATE",
  "STEAM",
  "STEEL",
  "STEEP",
  "STEER",
  "STICK",
  "STILL",
  "STOCK",
  "STONE",
  "STOOD",
  "STORE",
  "STORM",
  "STORY",
  "STRIP",
  "STUCK",
  "STUDY",
  "STUFF",
  "STYLE",
  "SUGAR",
  "SUITE",
  "SUPER",
  "SWEET",
  "TABLE",
  "TAKEN",
  "TASTE",
  "TAXES",
  "TEACH",
  "TEAMS",
  "TEETH",
  "TERRY",
  "TEXAS",
  "THANK",
  "THEFT",
  "THEIR",
  "THEME",
  "THERE",
  "THESE",
  "THICK",
  "THING",
  "THINK",
  "THIRD",
  "THOSE",
  "THREE",
  "THREW",
  "THROW",
  "THUMB",
  "TIGHT",
  "TIRED",
  "TITLE",
  "TODAY",
  "TOPIC",
  "TOTAL",
  "TOUCH",
  "TOUGH",
  "TOWER",
  "TRACK",
  "TRADE",
  "TRAIN",
  "TREAT",
  "TREND",
  "TRIAL",
  "TRIBE",
  "TRICK",
  "TRIED",
  "TRIES",
  "TRUCK",
  "TRULY",
  "TRUNK",
  "TRUST",
  "TRUTH",
  "TWICE",
  "TWIST",
  "TYLER",
  "UNCLE",
  "UNDER",
  "UNDUE",
  "UNION",
  "UNITY",
  "UNTIL",
  "UPPER",
  "UPSET",
  "URBAN",
  "USAGE",
  "USUAL",
  "VALID",
  "VALUE",
  "VIDEO",
  "VIRUS",
  "VISIT",
  "VITAL",
  "VOCAL",
  "VOICE",
  "WASTE",
  "WATCH",
  "WATER",
  "WHEEL",
  "WHERE",
  "WHICH",
  "WHILE",
  "WHITE",
  "WHOLE",
  "WHOSE",
  "WOMAN",
  "WOMEN",
  "WORLD",
  "WORRY",
  "WORSE",
  "WORST",
  "WORTH",
  "WOULD",
  "WRITE",
  "WRONG",
  "WROTE",
  "YOUNG",
  "YOUTH",
]

const MAX_GUESSES = 6
const WORD_LENGTH = 5

const LETTER_STATE = {
  CORRECT: "correct",
  PRESENT: "present",
  ABSENT: "absent",
  PENDING: "pending",
  EMPTY: "empty",
}

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState("")
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [keyboardStatus, setKeyboardStatus] = useState({})
  const [shake, setShake] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [showInvalidMessage, setShowInvalidMessage] = useState(false)
  const [invalidMessage, setInvalidMessage] = useState("")
  const [stats, setStats] = useState({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
  })

  const initializeGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]
    setTargetWord(randomWord)
    setGuesses([])
    setCurrentGuess("")
    setGameOver(false)
    setWon(false)
    setKeyboardStatus({})
  }, [])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const getLetterStatus = (letter, position, word) => {
    if (targetWord[position] === letter) {
      return LETTER_STATE.CORRECT
    } else if (targetWord.includes(letter)) {
      // Check if this letter appears more times in the guess than in the target
      const targetCount = targetWord.split("").filter((l) => l === letter).length
      const guessCount = word.split("").filter((l, i) => l === letter && i <= position).length
      const correctPositions = word.split("").filter((l, i) => l === letter && targetWord[i] === letter).length

      if (guessCount <= targetCount - correctPositions) {
        return LETTER_STATE.PRESENT
      }
      return LETTER_STATE.ABSENT
    } else {
      return LETTER_STATE.ABSENT
    }
  }

  const updateKeyboardStatus = (word) => {
    const newStatus = { ...keyboardStatus }

    for (let i = 0; i < word.length; i++) {
      const letter = word[i]
      const status = getLetterStatus(letter, i, word)

      // Only update if the new status is "better" than the current one
      if (
        !newStatus[letter] ||
        (newStatus[letter] === LETTER_STATE.ABSENT && status !== LETTER_STATE.ABSENT) ||
        (newStatus[letter] === LETTER_STATE.PRESENT && status === LETTER_STATE.CORRECT)
      ) {
        newStatus[letter] = status
      }
    }

    setKeyboardStatus(newStatus)
  }

  const isValidWord = (word) => {
    return WORD_LIST.includes(word)
  }

  const submitGuess = () => {
    if (currentGuess.length !== WORD_LENGTH) {
      setInvalidMessage("Not enough letters")
      setShowInvalidMessage(true)
      setShake(true)
      setTimeout(() => {
        setShowInvalidMessage(false)
        setShake(false)
      }, 1500)
      return
    }

    if (!isValidWord(currentGuess)) {
      setInvalidMessage("Not in word list")
      setShowInvalidMessage(true)
      setShake(true)
      setTimeout(() => {
        setShowInvalidMessage(false)
        setShake(false)
      }, 1500)
      return
    }

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    updateKeyboardStatus(currentGuess)

    if (currentGuess === targetWord) {
      setWon(true)
      setGameOver(true)
      setBounce(true)
      setTimeout(() => setBounce(false), 2000)

      // Update stats
      const newStats = { ...stats }
      newStats.played++
      newStats.won++
      newStats.currentStreak++
      newStats.maxStreak = Math.max(newStats.maxStreak, newStats.currentStreak)
      newStats.distribution[newGuesses.length - 1]++
      setStats(newStats)
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true)

      // Update stats
      const newStats = { ...stats }
      newStats.played++
      newStats.currentStreak = 0
      setStats(newStats)
    }

    setCurrentGuess("")
  }

  const handleKeyPress = useCallback(
    (key) => {
      if (gameOver) return

      if (key === "ENTER") {
        submitGuess()
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1))
      } else if (key.length === 1 && key.match(/[A-Z]/)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + key)
        }
      }
    },
    [currentGuess, gameOver],
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase()
      if (key === "ENTER" || key === "BACKSPACE" || (key.length === 1 && key.match(/[A-Z]/))) {
        e.preventDefault()
        handleKeyPress(key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyPress])

  const renderGrid = () => {
    const rows = []

    // Render completed guesses
    for (let i = 0; i < guesses.length; i++) {
      const guess = guesses[i]
      const row = []

      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = guess[j]
        const status = getLetterStatus(letter, j, guess)
        const delay = j * 0.2

        row.push(
          <motion.div
            key={j}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: [0, 90, 0], scale: bounce && status === LETTER_STATE.CORRECT ? [1, 1.1, 1] : 1 }}
            transition={{
              rotateX: { duration: 0.5, delay },
              scale: { duration: 0.3, delay: 0.5 + delay },
            }}
            className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold ${
              status === LETTER_STATE.CORRECT
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white border-green-500"
                : status === LETTER_STATE.PRESENT
                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-500"
                  : "bg-gradient-to-br from-gray-600 to-gray-800 text-white border-gray-500"
            }`}
          >
            {letter}
          </motion.div>,
        )
      }

      rows.push(
        <div key={i} className="flex gap-1">
          {row}
        </div>,
      )
    }

    // Render current guess row
    if (!gameOver) {
      const currentRow = []
      for (let j = 0; j < WORD_LENGTH; j++) {
        const letter = currentGuess[j] || ""
        currentRow.push(
          <motion.div
            key={j}
            animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
            transition={{ duration: 0.4 }}
            className={`w-14 h-14 border-2 flex items-center justify-center text-2xl font-bold ${
              letter ? "border-gray-400 bg-gray-100" : "border-gray-300 bg-white"
            }`}
          >
            {letter}
          </motion.div>,
        )
      }

      rows.push(
        <div key={guesses.length} className="flex gap-1">
          {currentRow}
        </div>,
      )
    }

    // Render empty rows
    const remainingRows = MAX_GUESSES - rows.length
    for (let i = 0; i < remainingRows; i++) {
      const emptyRow = []
      for (let j = 0; j < WORD_LENGTH; j++) {
        emptyRow.push(
          <div key={j} className="w-14 h-14 border-2 border-gray-200 flex items-center justify-center bg-white" />,
        )
      }

      rows.push(
        <div key={guesses.length + 1 + i} className="flex gap-1">
          {emptyRow}
        </div>,
      )
    }

    return rows
  }

  const renderKeyboard = () => {
    const rows = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
    ]

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex gap-1 justify-center">
        {row.map((key) => {
          const status = keyboardStatus[key]
          const isSpecial = key === "ENTER" || key === "BACKSPACE"

          let bgColor = "bg-gray-200 hover:bg-gray-300"
          if (status === LETTER_STATE.CORRECT) {
            bgColor = "bg-gradient-to-br from-green-400 to-green-600 text-white"
          } else if (status === LETTER_STATE.PRESENT) {
            bgColor = "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
          } else if (status === LETTER_STATE.ABSENT) {
            bgColor = "bg-gradient-to-br from-gray-600 to-gray-800 text-white"
          }

          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleKeyPress(key)}
              className={`h-14 rounded-md font-bold text-sm transition-colors ${isSpecial ? "px-3 text-xs" : "w-10"} ${bgColor}`}
              disabled={gameOver}
            >
              {key === "BACKSPACE" ? "⌫" : key}
            </motion.button>
          )
        })}
      </div>
    ))
  }

  const renderStats = () => {
    const maxCount = Math.max(...stats.distribution, 1)

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.played}</div>
            <div className="text-sm text-gray-500">Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Win %</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.currentStreak}</div>
            <div className="text-sm text-gray-500">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{stats.maxStreak}</div>
            <div className="text-sm text-gray-500">Max Streak</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm font-medium">GUESS DISTRIBUTION</div>
          {stats.distribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 text-sm">{i + 1}</div>
              <div
                className={`h-6 rounded-sm flex items-center px-2 text-xs font-medium ${
                  won && guesses.length === i + 1 ? "bg-green-500 text-white" : "bg-gray-300"
                }`}
                style={{ width: `${(count / maxCount) * 100}%`, minWidth: count > 0 ? "2rem" : "1rem" }}
              >
                {count > 0 ? count : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderHowToPlay = () => {
    return (
      <div className="space-y-4">
        <p>Guess the WORDLE in 6 tries.</p>
        <p>Each guess must be a valid 5-letter word. Hit the enter button to submit.</p>
        <p>After each guess, the color of the tiles will change to show how close your guess was to the word.</p>

        <div className="space-y-2">
          <div className="font-medium">Examples</div>

          <div>
            <div className="flex gap-1">
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-green-500 text-white border-green-600">
                W
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                E
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                A
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                R
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                Y
              </div>
            </div>
            <p className="text-sm mt-2">The letter W is in the word and in the correct spot.</p>
          </div>

          <div>
            <div className="flex gap-1">
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                P
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-yellow-500 text-white border-yellow-600">
                I
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                L
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                L
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                S
              </div>
            </div>
            <p className="text-sm mt-2">The letter I is in the word but in the wrong spot.</p>
          </div>

          <div>
            <div className="flex gap-1">
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                V
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                A
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                G
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-600 text-white border-gray-700">
                U
              </div>
              <div className="w-10 h-10 border-2 flex items-center justify-center font-bold bg-gray-200 border-gray-300">
                E
              </div>
            </div>
            <p className="text-sm mt-2">The letter U is not in the word in any spot.</p>
          </div>
        </div>
      </div>
    )
  }

  const shareResults = () => {
    if (!gameOver) return

    let result = `Wordle ${won ? guesses.length : "X"}/6\n\n`

    guesses.forEach((guess) => {
      let row = ""
      for (let i = 0; i < guess.length; i++) {
        const status = getLetterStatus(guess[i], i, guess)
        if (status === LETTER_STATE.CORRECT) {
          row += "🟩"
        } else if (status === LETTER_STATE.PRESENT) {
          row += "🟨"
        } else {
          row += "⬛"
        }
      }
      result += row + "\n"
    })

    navigator.clipboard.writeText(result)
    alert("Results copied to clipboard!")
  }

  return (
    <Card className="w-fit mx-auto overflow-hidden border-0 shadow-2xl">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-600 to-teal-700">
        <div className="flex items-center justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How to Play</DialogTitle>
              </DialogHeader>
              {renderHowToPlay()}
            </DialogContent>
          </Dialog>

          <CardTitle className="text-center text-2xl font-bold text-white">WORDLE</CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Info className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Statistics</DialogTitle>
              </DialogHeader>
              {renderStats()}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="relative">
          {/* Invalid word message */}
          <AnimatePresence>
            {showInvalidMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-10 left-0 right-0 bg-black text-white py-1 px-4 rounded-md text-center"
              >
                {invalidMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Grid */}
          <div className="flex flex-col gap-1 items-center">{renderGrid()}</div>
        </div>

        {/* Game Status */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-lg shadow-md text-center space-y-3"
          >
            {won ? (
              <div className="space-y-2">
                <div className="text-green-600 font-bold text-xl flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Magnificent!
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  You got it in {guesses.length} {guesses.length === 1 ? "try" : "tries"}!
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-600 font-bold text-xl">Game Over</div>
                <div className="text-lg">
                  The word was: <span className="font-bold text-emerald-600">{targetWord}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button onClick={initializeGame} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                New Game
              </Button>
              <Button onClick={shareResults} variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </motion.div>
        )}

        {/* Virtual Keyboard */}
        <div className="space-y-2">{renderKeyboard()}</div>

        <div className="text-center text-sm text-muted-foreground">
          Guess the 5-letter word in 6 tries. Use your keyboard or click the letters!
        </div>
      </CardContent>
    </Card>
  )
}
