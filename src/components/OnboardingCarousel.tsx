import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    title: 'Welcome to SafvaCut',
    description: 'Your secure cryptocurrency exchange platform',
    icon: '🔐',
  },
  {
    title: 'Fast & Secure',
    description: 'Trade with confidence using our secure platform',
    icon: '⚡',
  },
  {
    title: 'Easy to Use',
    description: 'Simple interface for buying, selling, and managing crypto',
    icon: '✨',
  },
  {
    title: 'Get Started',
    description: 'Create your account and start trading today',
    icon: '🚀',
  },
]

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)

  function nextSlide() {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  function prevSlide() {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className="text-7xl mb-6">{slides[currentSlide].icon}</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {slides[currentSlide].title}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className={currentSlide === 0 ? 'text-gray-300' : 'text-gray-600'} />
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className={currentSlide === slides.length - 1 ? 'text-gray-300' : 'text-gray-600'} />
          </button>
        </div>

        {currentSlide === slides.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-3"
          >
            <a
              href="/signup"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Create Account
            </a>
            <a
              href="/login"
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-center"
            >
              Log In
            </a>
          </motion.div>
        )}
      </div>
    </div>
  )
}
