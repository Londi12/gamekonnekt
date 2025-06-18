import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'GameKonnekt - Play Classic Games Online',
  description: 'GameKonnekt is your ultimate destination for classic games - play online or download to play offline. Connect. Play. Download. Enjoy!',
  keywords: 'games, online games, classic games, tetris, 2048, snake, memory match, flappy bird, wordle, minesweeper, typing speed, breakout, sudoku, tic tac toe',
  authors: [{ name: 'GameKonnekt Team' }],
  creator: 'GameKonnekt',
  publisher: 'GameKonnekt',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gamekonnekt.com',
    title: 'GameKonnekt - Play Classic Games Online',
    description: 'Your ultimate destination for classic games - play online or download to play offline',
    siteName: 'GameKonnekt',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GameKonnekt - Play Classic Games Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GameKonnekt - Play Classic Games Online',
    description: 'Your ultimate destination for classic games - play online or download to play offline',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
