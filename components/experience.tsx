"use client"

import { motion } from "framer-motion"
import { Briefcase, Calendar, MapPin } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const experiences = [
  {
    title: "Software Engineer Volunteer",
    company: "ArteMed Stiftung",
    location: "Remote",
    period: "Sep 2023 - Present",
    description: [
      "Build a Electron Windows App to streamline patient data management and monitor illness outbreaks",
      "Implemented offline data storage and excel export functionality with PostgreSQL",
    ],
    image: "/artemed_logo.png?height=80&width=80",
  },
  {
    title: "Student Work Experience",
    company: "Google",
    location: "Munich, DE",
    period: "Jun 2022 - Jul 2022",
    description: [
      "Developed a game recommendation system with Steam Web APIs, and Node.js",
      "Led a team of four students and presented work to Google host team",
    ],
    image: "/google_logo.png?height=80&width=80",
  },
]

export default function Experience() {
  return (
    <section id="experience" className="py-20 mb-10 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 inline-block relative">
            Work Experience
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/0"></span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            My professional journey and the experiences that have shaped my skills.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>

          <div className="space-y-12">
            {experiences.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className={`flex flex-col ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 relative`}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/50 z-10 hidden md:block"></div>

                <div className="w-full md:w-1/2 md:pr-12 md:text-right">
                  <div className="bg-gray-800/50 backdrop-blur rounded-xl shadow-lg overflow-hidden border border-gray-700/50 hover:border-primary/30 transition-all duration-300">
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      {/* Logo Section - Always positioned towards the inside (timeline) */}
                      <div
                        className={`flex justify-center ${
                          index % 2 === 0 ? "md:justify-end md:order-2" : "md:justify-start md:order-1"
                        }`}
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={exp.image || "/placeholder.svg"}
                            alt={exp.company}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br to-transparent mix-blend-overlay"></div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div
                        className={`flex-1 flex flex-col ${
                          index % 2 === 0
                            ? "md:items-end md:text-right md:order-1"
                            : "md:items-start md:text-left md:order-2"
                        }`}
                      >
                        <h3 className="text-xl font-bold">{exp.title}</h3>

                        <div className={`flex items-center gap-4 mb-4 ${
                              index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                            }`}
                          >
                          <div className={`flex items-center gap-2`}>
                            <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{exp.company}</span>
                          </div>

                          <div className={`flex items-center gap-2`}>
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-medium">{exp.location}</span>
                          </div>
                        </div>

                        <div
                          className={`flex items-center text-sm text-muted-foreground mb-4 ${
                            index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
                          }`}
                        >
                          <Calendar
                            className={`h-4 w-4 text-primary flex-shrink-0 ${index % 2 === 0 ? "md:ml-2" : "md:mr-2"}`}
                          />
                          <span>{exp.period}</span>
                        </div>

                        <ul className={`space-y-2 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                          {exp.description.map((item, i) => (
                            <li key={i} className={`flex items-start gap-2 ${index % 2 === 0 ? "md:justify-end" : ""}`}>
                              <div
                                className={`h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0 ${
                                  index % 2 === 0 ? "md:order-2" : ""
                                }`}
                              ></div>
                              <span className={index % 2 === 0 ? "md:order-1" : ""}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/2 md:pl-12 hidden md:block">
                  {/* This is an empty div to maintain the timeline layout */}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
