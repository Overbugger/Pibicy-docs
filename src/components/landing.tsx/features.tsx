"use client"

import { FileText, PenTool, Type, Highlighter } from "lucide-react"
import { motion } from "framer-motion"

export function Features() {
  const features = [
    {
      icon: FileText,
      title: "Multiple File Formats",
      description: "Support for PDF, Word, Excel documents and more",
    },
    {
      icon: PenTool,
      title: "Drawing Tools",
      description: "Add shapes, arrows, and freehand drawings",
    },
    {
      icon: Type,
      title: "Text Annotations",
      description: "Add text boxes and comments anywhere",
    },
    {
      icon: Highlighter,
      title: "Highlighting",
      description: "Highlight important sections with custom colors",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  }

  return (
    <section className="w-full py-24">
      <div className="px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Powerful Features</h2>
            <p className="max-w-[900px] text-black/50 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Everything you need to annotate and enhance your documents
            </p>
          </div>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center space-y-4 rounded-lg border p-6 transition-colors hover:bg-muted/50"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="rounded-full bg-black/10 p-3"
              >
                <feature.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold text-center">{feature.title}</h3>
              <p className="text-center text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

