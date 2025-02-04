import { useState } from "react";
import FileViewer from './components/FileViewer';
import { FileUpload } from './components/FileUpload';
import { Upload } from 'lucide-react';
import { motion } from "framer-motion"
import { AnimatedBackground } from "./components/landing.tsx/heroBackGround";
import { HowItWorks } from "./components/landing.tsx/howItWorks";
import { Features } from "./components/landing.tsx/features";
import { Footer } from "./components/landing.tsx/footer";

export const App = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {!selectedFile ? (
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            <section className="relative overflow-hidden bg-background px-6 py-24 sm:py-32 lg:px-8">
            <AnimatedBackground />
            <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-6 backdrop-blur-md"
            >
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-gradient-to-br from-purple-500 to-blue-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-6xl"
              >
                Document Annotation Made Simple
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="mt-6 text-lg leading-8 text-foreground"
              >
                A powerful tool for adding shapes, text, and highlights to your documents. Support for PDF, Word, Excel,
                Images, and more.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-10"
              >
                <FileUpload onFileSelect={setSelectedFile} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-6 flex items-center justify-center gap-4"
              >
                <div className="border-none bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    Supports PDF, DOC, XLS, JPG, PNG & MSG files
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          </section>

          <HowItWorks />
          
          <Features />

          <Footer />
          </main>
        </div>
      ) : (
        <FileViewer file={selectedFile} />
      )}
    </div>
  );
};
