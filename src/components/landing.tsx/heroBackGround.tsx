"use client"

import { motion } from "framer-motion"

export function AnimatedBackground() {
  return (
    <>
      {/* Base layer with animated gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(-45deg, rgba(147,51,234,0.15), rgba(59,130,246,0.15), rgba(147,51,234,0.15), rgba(59,130,246,0.15))",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      />

      {/* Animated shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 0],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="absolute right-1/3 top-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[100px]"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [180, 0, 180],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        className="absolute left-1/3 bottom-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]"
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #808080 1px, transparent 1px),
            linear-gradient(to bottom, #808080 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  )
}

