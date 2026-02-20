"use client"

const data = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Maximilian Miller",
  "url": "https://www.maxtmiller.dev",
  "jobTitle": "Math @ UWaterloo",
  "sameAs": [
    "https://www.github.com/maxtmiller",
    "https://www.linkedin.com/in/maximiliantmiller",
    "https://www.maxtmiller.github.io",
    "https://twitter.com/maxtmiller_"
  ],
  "knowsAbout": [
    "Machine Learning Engineering",
    "Large Language Models (LLMs)",
    "Vector Database Architecture",
    "Backend System Design",
    "MLOps and Model Deployment",
    "REST & GraphQL API Design"
  ],
  "description": "Full-Stack Developer and AI Engineer specializing in building scalable Backend architectures and integrating Machine Learning models into production environments. Expert in Next.js, Python, and Large Language Model (LLM) orchestration for high-performance web applications."
}

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}