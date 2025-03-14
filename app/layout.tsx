import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Maximilian Miller",
  description: "Personal portfolio of Maximilian Miller",
  icons: {
    icon: [
      { url: "/logo.jpg" },
      { url: "/logo.jpg", sizes: "16x16", type: "image/jpg" },
      { url: "/logo.jpg", sizes: "32x32", type: "image/jpg" },
    ],
    apple: [{ url: "/logo.jpg", sizes: "180x180", type: "image/jpg" }],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.jpg",
        color: "#9333EA",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'