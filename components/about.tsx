"use client"

import { motion, AnimatePresence } from "framer-motion"
import { GraduationCap, User, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useEffect, useState } from "react"

const images = [
  "/background1.jpg?height=600&width=400&text=Germany",
  "/background2.jpg?height=600&width=400&text=Thailand",
  "/background3.jpg?height=600&width=400&text=Austria",
  "/background4.jpg?height=600&width=400&text=Italy",
  "/background5.jpg?height=600&width=400&text=USA",
]

export default function About() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
            About Me
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/0"></span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get to know more about me, my background, and what drives me forward.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="bg-card/50 backdrop-blur border-primary/10 shadow-lg bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700/50 hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Who I Am
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  I&apos;m a passionate backend developer and student with a keen interest in emerging technologies, especially LLMs and AI agents.
                </p>
                <p className="text-muted-foreground">
                  When I&apos;m not coding, you can find me hiking, skiing, learning about geography, playing table tennis or reading biographies, especially from Walter Isaacson.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10 shadow-lg bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700/50 hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                <div className="border-l-2 border-primary/50 pl-4 py-2 flex items-center space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={"/waterloo_logo.png?height=80&width=80" || "/placeholder.svg"}
                      alt={"Waterloo"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br to-transparent mix-blend-overlay"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold">University of Waterloo</h4>
                    <p className="text-sm text-muted-foreground">Bachelor&apos;s of Mathematics</p>
                    <p className="text-sm text-muted-foreground">2024 - Present</p>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur border-primary/10 shadow-lg bg-gray-800/50 backdrop-blur rounded-xl overflow-hidden border border-gray-700/50 hover:border-primary/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-xl">
                  <Wrench className="mr-2 h-5 w-5 text-primary" />
                  My Tech Stacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {["JavaScript", "Node.js", "MongoDB", "Python", "Flask", "Firebase"].map((skill) => (
                    <div key={skill} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <div className="relative h-[550px] w-full rounded-lg overflow-hidden shadow-xl shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/20 z-10 mix-blend-overlay pointer-events-none"></div>

              {/* Image Carousel */}
              <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: isAnimating ? 1.1 : 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={images[currentImageIndex] || "/placeholder.svg"}
                      alt={`Maximilian Miller - ${currentImageIndex}`}
                      fill
                      className="object-cover"
                      priority={currentImageIndex === 0}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setIsAnimating(true)
                        setTimeout(() => {
                          setCurrentImageIndex(index)
                          setIsAnimating(false)
                        }, 500)
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex ? "bg-primary w-6" : "bg-white/50"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Background effects */}
            <div className="absolute -bottom-6 -right-6 h-48 w-48 bg-primary/10 rounded-full blur-3xl z-0"></div>
            <div className="absolute -top-6 -left-6 h-48 w-48 bg-primary/10 rounded-full blur-3xl z-0"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

