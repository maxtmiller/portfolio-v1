"use client"

import { useEffect, useRef } from "react"

export default function LightningEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Lightning bolt class
    class LightningBolt {
      x: number
      y: number
      xEnd: number
      yEnd: number
      width: number
      opacity: number
      color: string
      branches: number
      lifespan: number
      age: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = 0
        this.xEnd = this.x + (Math.random() * 300 - 150)
        this.yEnd = canvas!.height * (0.3 + Math.random() * 0.4)
        this.width = 1 + Math.random() * 3
        this.opacity = 0.6 + Math.random() * 0.4
        this.color = `rgba(138, 43, 226, ${this.opacity})`
        this.branches = Math.floor(Math.random() * 3) + 1
        this.lifespan = 10 + Math.random() * 20
        this.age = 0
      }

      draw() {
        if (!ctx) return

        ctx.beginPath()
        ctx.moveTo(this.x, this.y)

        // Create a jagged path for the lightning
        let currentX = this.x
        let currentY = this.y
        const segments = 10
        const xDiff = (this.xEnd - this.x) / segments
        const yDiff = (this.yEnd - this.y) / segments

        for (let i = 0; i < segments; i++) {
          const nextX = currentX + xDiff + (Math.random() * 20 - 10)
          const nextY = currentY + yDiff
          ctx.lineTo(nextX, nextY)
          currentX = nextX
          currentY = nextY
        }

        // Set the lightning style
        ctx.strokeStyle = this.color
        ctx.lineWidth = this.width
        ctx.globalAlpha = Math.max(0, 1 - this.age / this.lifespan)
        ctx.shadowColor = "rgba(138, 43, 226, 0.8)"
        ctx.shadowBlur = 15
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0

        // Draw branches
        if (this.branches > 0 && this.age < this.lifespan * 0.5) {
          for (let i = 0; i < this.branches; i++) {
            const branchStartPoint = Math.random()
            const branchX = this.x + (this.xEnd - this.x) * branchStartPoint
            const branchY = this.y + (this.yEnd - this.y) * branchStartPoint

            ctx.beginPath()
            ctx.moveTo(branchX, branchY)

            const branchEndX = branchX + (Math.random() * 100 - 50)
            const branchEndY = branchY + Math.random() * 100

            // Create jagged branch
            let branchCurrentX = branchX
            let branchCurrentY = branchY
            const branchSegments = 5
            const branchXDiff = (branchEndX - branchX) / branchSegments
            const branchYDiff = (branchEndY - branchY) / branchSegments

            for (let j = 0; j < branchSegments; j++) {
              const nextBranchX = branchCurrentX + branchXDiff + (Math.random() * 10 - 5)
              const nextBranchY = branchCurrentY + branchYDiff
              ctx.lineTo(nextBranchX, nextBranchY)
              branchCurrentX = nextBranchX
              branchCurrentY = nextBranchY
            }

            ctx.strokeStyle = this.color
            ctx.lineWidth = this.width * 0.6
            ctx.globalAlpha = Math.max(0, 0.7 - this.age / this.lifespan)
            ctx.shadowColor = "rgba(138, 43, 226, 0.5)"
            ctx.shadowBlur = 10
            ctx.stroke()
            ctx.globalAlpha = 1
            ctx.shadowBlur = 0
          }
        }

        this.age++
      }

      isFinished() {
        return this.age >= this.lifespan
      }
    }

    // Array to store lightning bolts
    const lightningBolts: LightningBolt[] = []

    // Animation loop
    const animate = () => {
      // Clear canvas with a slight fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Randomly create new lightning
      if (Math.random() < 0.03) {
        lightningBolts.push(new LightningBolt())
      }

      // Draw and update all lightning bolts
      for (let i = 0; i < lightningBolts.length; i++) {
        lightningBolts[i].draw()

        // Remove finished lightning bolts
        if (lightningBolts[i].isFinished()) {
          lightningBolts.splice(i, 1)
          i--
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />
}

