"use client"

import { Upload, Pencil, Download } from "lucide-react"
import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Document",
      description: "Start by uploading any supported document format - PDF, Word, Excel, Images, or Outlook messages.",
    },
    {
      icon: Pencil,
      title: "Add Annotations",
      description: "Draw shapes, add text boxes, highlight important parts, and make your document more informative.",
    },
    {
      icon: Download,
      title: "Save & Export",
      description: "Download your annotated document in its original format with all your edits preserved.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="w-full py-24 bg-gradient-to-b from-blue-500/10 to-blue-500/50">
      <div className="px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center space-y-4 text-center"
        >
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
            <p className="max-w-[900px] text-black/50 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Three simple steps to annotate your documents
            </p>
          </div>
        </motion.div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              initial="initial"
              whileHover="hover"
              className="relative flex flex-col items-center space-y-4 rounded-lg p-6 shadow-lg"
            >
              <motion.div
                variants={{
                  initial: { rotate: 0 },
                  hover: { rotate: 360, transition: { duration: 0.5 } }
                }}
                className="rounded-full bg-blue-500/50 p-3"
              >
                <step.icon className="h-6 w-6 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-center text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

