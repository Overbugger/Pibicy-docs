"use client"

import { Github } from "lucide-react"
import { motion } from "framer-motion"

export function Footer() {
  return (
    <footer className="w-full border-t bg-black/10">
      <div className="flex flex-col items-center justify-between gap-4 px-6 py-10 md:h-24 md:flex-row md:py-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0"
        >
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built in ⚔️ by{" "}
            <span className="font-medium font-bold text-lg">
             Okoro Samuel
            </span>
            . The source code is available on{" "}
            <a href="https://github.com/Overbugger/Pibicy-docs" className="font-medium underline underline-offset-4">
              GitHub
            </a>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <a href="https://github.com/Overbugger" className="rounded-2xl bg-muted p-2 hover:bg-muted/80">
         
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
          {/* <a href="#" className="rounded-2xl bg-muted p-2 hover:bg-muted/80">
            <Twitter className="h-5 w-5" />
            <span className="sr-only">Twitter</span>
          </a> */}
        </motion.div>
      </div>
    </footer>
  )
}

