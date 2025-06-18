"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole filled with the ends of worms and an oozy smell.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness.",
  "To be or not to be, that is the question. Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune.",
  "All happy families are alike; each unhappy family is unhappy in its own way. Everything was in confusion in the Oblonskys house.",
  "Call me Ishmael. Some years ago never mind how long precisely having little or no money in my purse, and nothing particular to interest me on shore.",
  "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
  "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God.",
]

export default function TypingSpeedGame() {
  const [text, setText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [currentIndex, setCurrentIndex] = useState(0)

  const startTest = useCallback(() => {
    const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
    setText(randomText)
    setUserInput("")
    setStartTime(Date.now())
    setEndTime(null)
    setIsActive(true)
    setWpm(0)
    setAccuracy(100)
    setCurrentIndex(0)
  }, [])

  const calculateStats = useCallback(() => {
    if (!startTime || userInput.length === 0) return

    const timeElapsed = (Date.now() - startTime) / 1000 / 60 // minutes
    const wordsTyped = userInput.length / 5 // standard word length
    const currentWpm = Math.round(wordsTyped / timeElapsed) || 0

    // Calculate accuracy
    let correctChars = 0
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === text[i]) {
        correctChars++
      }
    }
    const currentAccuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100

    setWpm(currentWpm)
    setAccuracy(currentAccuracy)
  }, [startTime, userInput, text])

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(calculateStats, 100)
      return () => clearInterval(interval)
    }
  }, [isActive, calculateStats])

  const handleInputChange = (e) => {
    const value = e.target.value

    if (!isActive) return

    setUserInput(value)
    setCurrentIndex(value.length)

    if (value === text) {
      setEndTime(Date.now())
      setIsActive(false)
    }
  }

  const getCharacterClass = (index) => {
    if (index < userInput.length) {
      return userInput[index] === text[index] ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
    } else if (index === currentIndex) {
      return "bg-blue-200 border-l-2 border-blue-500"
    }
    return "text-gray-600"
  }

  const progress = text.length > 0 ? (userInput.length / text.length) * 100 : 0

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Typing Speed Test</CardTitle>
        <div className="flex justify-center gap-4">
          <Badge variant="outline" className="text-lg px-3 py-1">
            WPM: {wpm}
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Accuracy: {accuracy}%
          </Badge>
          <Badge variant="outline" className="text-lg px-3 py-1">
            Progress: {Math.round(progress)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {text && (
          <>
            <Progress value={progress} className="w-full h-2" />

            <div className="p-4 bg-gray-50 rounded-lg border-2 min-h-32">
              <div className="text-lg leading-relaxed font-mono">
                {text.split("").map((char, index) => (
                  <span key={index} className={`${getCharacterClass(index)} px-0.5`}>
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <textarea
              value={userInput}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              className="w-full h-32 p-4 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none font-mono"
              disabled={!isActive && !endTime}
            />
          </>
        )}

        {endTime && (
          <div className="text-center space-y-4 p-6 bg-green-50 rounded-lg border-2 border-green-200">
            <h3 className="text-2xl font-bold text-green-800">Test Complete! 🎉</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{wpm}</div>
                <div className="text-sm text-gray-600">Words Per Minute</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{Math.round((endTime - startTime) / 1000)}s</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <Button onClick={startTest} className="w-full text-lg py-3">
            {isActive ? "Restart Test" : endTime ? "Take Another Test" : "Start Typing Test"}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Type the text above as quickly and accurately as possible.</p>
          <p>Your WPM (Words Per Minute) and accuracy will be calculated in real-time.</p>
        </div>
      </CardContent>
    </Card>
  )
}
