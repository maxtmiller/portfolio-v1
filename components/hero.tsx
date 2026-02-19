"use client"

import { useEffect, useState } from "react"
import { TypeAnimation } from "react-type-animation"
import Image from "next/image"
import { ArrowDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background"></div>
      </div>

      <div className="container mx-auto px-4 z-10 mb-8">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="w-full md:w-3/5 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block">Hi, I&apos;m</span>
              <span className="text-primary">Maximilian Miller</span>
            </h1>

            <h2 className="text-xl md:text-2xl lg:text-3xl text-muted-foreground">
              <span>I&apos;m a </span>
              {mounted && (
                <TypeAnimation
                  sequence={["Student", 1500, "Software Developer", 1500, "Math Enthusiast", 1500, "GeoGuessr Nerd", 1500, "Skier", 1500, "World Traveler", 1500]}
                  wrapper="span"
                  speed={50}
                  className="text-primary font-medium"
                  repeat={Number.POSITIVE_INFINITY}
                />
              )}
            </h2>

            <p className="text-muted-foreground max-w-xl mx-auto md:mx-0">
              Building innovative solutions and exploring new technologies. Passionate about creating impactful digital
              experiences.
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <a href="#projects">
                <Button className="group">
                  View My Work
                  <ArrowDown className="ml-2 h-4 w-4 group-hover:animate-bounce" />
                </Button>
              </a>
              <a href="https://maxtmiller.github.io/resume" target="_blank" rel="noreferrer">
                <Button variant="outline">
                  View Resume
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#contact">
                <Button variant="ghost">
                  Contact Me
                </Button>
              </a>
            </div>
          </div>

          <div className="w-full md:w-2/5 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent z-10 mix-blend-overlay"></div>
              <Image
                src="/profile.png?height=320&width=320"
                alt="Maximilian Miller"
                width={320}
                height={320}
                className="object-cover w-full h-full"
                priority
                style={{ height: "100% !important" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#about" aria-label="Scroll to About section">
          <ArrowDown className="h-6 w-6 text-primary" />
        </a>
      </div>
    </section>
  )
}

