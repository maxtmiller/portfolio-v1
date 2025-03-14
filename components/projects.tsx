"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const projects = [
  {
    title: "Nourish Net",
    description:
      "A platform that connects businesses and food banks, making food donations seamless and rewarding.",
    image: "/nourishnet_cover.png?height=300&width=500",
    tags: ["Flask", "MongoDB", "Socket.IO"],
    github: "https://github.com/maxtmiller/NourishNet",
    demo: "https://nourishnet-0zj7.onrender.com/",
  },
  {
    title: "Crypto Companion",
    description:
      "A platform to help beginners navigate the crypto market through curated insights, visualization, and advice.",
    image: "/crpytocompanion_cover.png?height=300&width=500",
    tags: ["Node.js", "React", "CohereAPI"],
    github: "https://github.com/maxtmiller/Crypto-Companion",
    demo: "#",
  },
  {
    title: "Spot Sense",
    description:
      "A user-friendly web app that simplifies skin cancer detection through real-time detection, and instant advice.",
    image: "/spotsense_cover.png?height=300&width=500",
    tags: ["Flask", "Tensorflow", "Pillow"],
    github: "https://github.com/maxtmiller/Spot-Sense",
    demo: "#",
  },
  {
    title: "AI Vault",
    description:
      "A platform where developers can share AI models, simplifying the discovery and integration of AI solutions.",
    image: "/aivault_cover.png?height=300&width=500",
    tags: ["Node.js", "MongoDB", "Auth0"],
    github: "https://github.com/maxtmiller/AI-Vault",
    demo: "https://youtu.be/-ajjSLZld-E",
  },
  {
    title: "Fluent Flow",
    description:
      "A platform for practicing foreign languages speaking skills through conversations and advice from an AI.",
    image: "/fluentflow_cover.png?height=300&width=500",
    tags: ["Flask", "OpenAI", "FFmpeg"],
    github: "https://github.com/maxtmiller/Fluent-Flow",
    demo: "https://youtu.be/6mJzdJuDNfQ",
  },
  {
    title: "Uniply",
    description:
      "A platform for practicing foreign languages speaking skills through conversations and advice from an AI.",
    image: "/uniply_cover.png?height=300&width=200",
    tags: ["SwiftUI", "XCode", "Figma"],
    github: "https://github.com/maxtmiller/Uniply",
    demo: "https://youtu.be/sO30QM-T47c",
  },
]

export default function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
            My Projects
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/0"></span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore some of my recent work and personal projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <Card className="h-full overflow-hidden bg-card/50 backdrop-blur border-primary/10 shadow-lg transition-all duration-300 hover:shadow-primary/20 hover:border-primary/30">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    width={500}
                    height={300}
                    style={
                      project.title === "Uniply"
                        ? {
                            margin: "0 auto",
                            top: "0 !important",
                            // width: "50% !important",
                          }
                        : {}
                    }
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{project.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-muted-foreground">{project.description}</CardDescription>
                </CardContent>

                <CardFooter className="flex justify-between">
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>

                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary group"
                    >
                      <span>
                        {project.title === "Uniply" || project.title === "AI Vault" || project.title === "Fluent Flow" ? "View Demo" : "View Project"}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

