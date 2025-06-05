import React, { useState, useEffect, useRef } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import ChatForm from "@/components/ChatForm"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Menu, X } from "lucide-react"
import { Footer } from "./components/Footer"
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import RecreuterDashboard from "./components/RecreuterDashboard"
import RecruiterAccess from "./components/RecruiterAccess"
import HelloWorld from "./components/HelloWorld"
import StudentAccess from "./components/StudentAccess"
import HelloS from "./pages/HelloS"
import HelloRecruiter from './pages/helloR';

const partners = [
  [
    "https://images.unsplash.com/photo-1684563983781-ce52a026f139",
    "https://images.unsplash.com/photo-1564531718001-9813bc3fd35d",
    "https://images.unsplash.com/photo-1607615896122-6c919f897e55",
    "https://images.unsplash.com/photo-1683893519004-addd9f9d1dde",
    "https://images.unsplash.com/photo-1683893519004-addd9f9d1dde",
    "https://images.unsplash.com/photo-1607615896122-6c919f897e55",
  ],
  [
    "https://images.unsplash.com/photo-1607615896122-6c919f897e55",
    "https://images.unsplash.com/photo-1683893519004-addd9f9d1dde",
    "https://images.unsplash.com/photo-1684563983781-ce52a026f139",
    "https://images.unsplash.com/photo-1564531718001-9813bc3fd35d",
    "https://images.unsplash.com/photo-1564531718001-9813bc3fd35d",
    "https://images.unsplash.com/photo-1684563983781-ce52a026f139",
  ]
]

export default function App() {
  const [showForm, setShowForm] = useState(false)
  const videoRef = useRef(null)
  const controls = useAnimation()
  const [isHovering, setIsHovering] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate();

  const handleMouseMove = (e) => {
    if (!videoRef.current) return
    const { left, top, width, height } = videoRef.current.getBoundingClientRect()
    const x = (e.clientX - left) / width - 0.5
    const y = (e.clientY - top) / height - 0.5
    controls.start({
      rotateY: -x * 6,
      rotateX: y * 6,
      x: -x * 5,
      y: -y * 5,
      scale: 1.03,
      transition: { type: "spring", stiffness: 80, damping: 12 }
    })
  }

  const handleMouseLeave = () => {
    controls.start({
      rotateY: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    })
    setIsHovering(false)
  }
  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 group" style={{ textDecoration: 'none' }}>
              <img
                alt="StageQuest Logo"
                className="h-8 w-auto transition-transform group-hover:scale-105"
                src="https://images.unsplash.com/photo-1532759238051-32b615b1efb8"
                style={{ minWidth: 32 }}
              />
              <span className="font-bold text-xl text-black group-hover:text-blue-700 transition-colors">StageQuest</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              <Link to="#services" className="text-foreground/80 hover:text-foreground">Our Services</Link>
              <Link to="/recreuter" className="text-foreground/80 hover:text-foreground">recreuter space</Link>
              <Link to="/student" className="text-foreground/80 hover:text-foreground">students space</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowForm(true)}
              className="button-gradient hidden sm:flex"
            >
              Get Started
            </Button>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-white"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <Link 
                  to="#services" 
                  className="text-foreground/80 hover:text-foreground p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Our Services
                </Link>
                <Link 
                  to="/recreuter" 
                  className="text-foreground/80 hover:text-foreground p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recruiter Space
                </Link>
                <Link 
                  to="/student" 
                  className="text-foreground/80 hover:text-foreground p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Student Space
                </Link>
                <Button
                  onClick={() => {
                    setShowForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="button-gradient w-full sm:hidden"
                >
                  Get Started
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="min-h-screen pb-8">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Hero Section */}
                <section className="container mx-auto px-4 pt-20 sm:pt-28 pb-8 sm:pb-16 text-center">
                  <motion.h1 
                    className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    Leave it to <span className="gradient-text">StageQuest</span>
                  </motion.h1>
                  <motion.p
                    className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    We don't offer listings—we place you inside. Real internships, real companies, real experience. You're not browsing. You're building.
                  </motion.p>
                  <motion.div
                    className="youtube-container mb-8"
                    ref={videoRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    animate={controls}
                    style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                  >
                    {isPlaying ? (
                      <iframe
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                        title="StageQuest Introduction"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-2xl"
                      />
                    ) : (
                      <div
                        className="relative w-full h-full cursor-pointer rounded-2xl overflow-hidden"
                        onClick={handlePlayClick}
                      >
                        <img
                          src="https://img.youtube.com/vi/K27diMbCsuw/maxresdefault.jpg"
                          alt="Video Thumbnail"
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-20 h-20 text-white hover:text-gray-300 transition-colors"
                            fill="currentColor"
                            viewBox="0 0 84 84"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect x="18" y="18" width="48" height="48" fill="white" rx="12" ry="12" />
                            <circle opacity="0.9" cx="42" cy="42" r="36" fill="black" />
                            <polygon points="35,25 58,42 35,59" fill="white" rx="4" ry="4" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Button 
                      onClick={() => setShowForm(true)}
                      className="button-gradient text-lg px-8 py-6 rounded-full"
                    >
                      Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </motion.div>
                </section>
                {/* Partners Section */}
                <section className="py-6 sm:py-16 overflow-hidden">
                  <h2 className="text-base sm:text-xl text-center text-muted-foreground mb-4 sm:mb-8">
                    Trusted by Leading Companies
                  </h2>
                  <div className="relative max-w-7xl mx-auto px-4">
                    <div className="overflow-hidden relative w-full">
                      <div className="flex">
                        <div className="partners-scroll">
                          {[...partners[0], ...partners[0], ...partners[0]].map((src, idx) => (
                            <img
                              key={idx}
                              alt={`Partner company ${idx + 1}`}
                              src={src}
                              className="h-8 sm:h-12 w-auto max-w-full rounded-lg opacity-60 hover:opacity-100 transition-opacity mx-4 sm:mx-8"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden relative w-full mt-8">
                      <div className="flex">
                        <div className="partners-scroll-reverse">
                          {[...partners[1], ...partners[1], ...partners[1]].map((src, idx) => (
                            <img
                              key={idx}
                              alt={`Partner company ${idx + 6}`}
                              src={src}
                              className="h-8 sm:h-12 w-auto max-w-full rounded-lg opacity-60 hover:opacity-100 transition-opacity mx-4 sm:mx-8"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                {/* About */}
                <section className="container mx-auto px-4 py-8 sm:py-16 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">About StageQuest</h2>
                  <p className="max-w-2xl mx-auto text-base sm:text-lg mb-6 sm:mb-8 px-2">
                    We're on a mission to connect passionate students with meaningful internship opportunities.
                    Our team of dedicated mentors and industry experts work tirelessly to match you with
                    companies that share your values and vision.
                  </p>
                </section>
                {/* FAQ */}
                <section className="container mx-auto px-4 py-8 sm:py-16">
                  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">FAQ</h2>
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">What if I don't know what field to choose?</h3>
                        <p>That's completely normal! Our mentors will help you explore different fields based on your interests and strengths.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Do I need experience to get an internship?</h3>
                        <p>Not at all! Many companies value enthusiasm and potential over experience. We'll help you showcase your strengths.</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-lg mb-2">Will StageQuest help me prepare for interviews?</h3>
                        <p>Absolutely! We provide interview preparation, resume reviews, and personalized coaching to help you succeed.</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </>
            }
          />
          <Route path="/recreuter" element={<RecruiterAccess />} />
          <Route path="/student" element={<StudentAccess />} />
          <Route
            path="/hello"
            element={
              <ProtectedRoute>
                <HelloWorld />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecreuterDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/helloS" element={<HelloS />} />
          <Route path="/helloR" element={<HelloRecruiter />} />
          <Route path="/helloR/" element={<HelloRecruiter />} />
          
          {/* Include a catch-all redirect for incorrect URLs */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center flex-col p-4">
              <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
              <p className="mb-4">The page you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/")}>Go to Homepage</Button>
            </div>
          } />
        </Routes>
        {/* Footer */}
        <Footer />
        <AnimatePresence>
          {showForm && (
            <ChatForm isVisible={showForm} onClose={() => setShowForm(false)} />
          )}
        </AnimatePresence>
      </main>
    </>
  )
}
