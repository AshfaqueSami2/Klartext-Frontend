"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { LiquidButton } from "@/components/ui/liquid-button";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";
import { 
  structuredData, 
  websiteStructuredData, 
  courseStructuredData, 
  faqStructuredData,
  appStructuredData 
} from "@/config/seo-config";
import { 
  BookOpen, 
  Trophy, 
  ArrowRight, 
  Languages, 
  Sparkles,
  Zap,
  Target,
  Users,
  Star,
  Globe,
  Brain,
  Award,
  Play,
  CheckCircle,
  Headphones,
  MessageCircle,
  TrendingUp,
  Menu,
  X
} from "lucide-react";

// Dynamic imports for heavy components
const Particles = dynamic(() => import("@/components/Particles"), {
  ssr: false,
  loading: () => null,
});

// Gradient animated text
const GradientText = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => (
  <motion.span 
    className={`bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
    animate={{ backgroundPosition: ["0% center", "200% center"] }}
    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
  >
    {children}
  </motion.span>
);

// Gradient orb background element
const GradientOrb = ({ className = "", delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ 
      scale: [0.8, 1.2, 0.8], 
      opacity: [0.3, 0.6, 0.3] 
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    className={`absolute rounded-full blur-3xl ${className}`}
  />
);

// Feature Card Component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  desc, 
  gradient,
  delay = 0
}: { 
  icon: React.ElementType; 
  title: string; 
  desc: string; 
  gradient: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
    </div>
    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{desc}</p>
  </motion.div>
);

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  number, 
  label,
  delay = 0
}: { 
  icon: React.ElementType; 
  number: string; 
  label: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05 }}
    className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
  >
    <Icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 sm:mb-3 text-yellow-400" />
    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">{number}</div>
    <div className="text-xs sm:text-sm text-gray-400">{label}</div>
  </motion.div>
);

// Testimonial Card Component
const TestimonialCard = ({
  quote,
  name,
  role,
  avatar,
  delay = 0
}: {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className="text-sm sm:text-base text-gray-300 mb-6 italic">&ldquo;{quote}&rdquo;</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
        {avatar}
      </div>
      <div>
        <div className="font-semibold text-white text-sm sm:text-base">{name}</div>
        <div className="text-xs sm:text-sm text-gray-400">{role}</div>
      </div>
    </div>
  </motion.div>
);

// How It Works Step Component
const StepCard = ({
  number,
  title,
  description,
  icon: Icon,
  delay = 0
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="flex gap-4 sm:gap-6 items-start"
  >
    <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
      <span className="text-lg sm:text-2xl font-bold text-white">{number}</span>
    </div>
    <div className="flex-1 pt-1">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg sm:text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm sm:text-base text-gray-400">{description}</p>
    </div>
  </motion.div>
);

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Redirect to register if not logged in when clicking lessons
  const handleLessonsClick = (e: React.MouseEvent) => {
    if (!user && !isLoading) {
      e.preventDefault();
      router.push("/register");
    }
  };
  
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  // Track scroll for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/50 to-slate-950 overflow-hidden">
      {/* SEO Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }} />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particles className="absolute inset-0" particleCount={80} particleColors={["#a855f7", "#ec4899", "#06b6d4"]} />
        <GradientOrb className="w-[600px] h-[600px] -top-48 -left-48 bg-purple-600/30" delay={0} />
        <GradientOrb className="w-[500px] h-[500px] top-1/3 -right-32 bg-pink-600/20" delay={2} />
        <GradientOrb className="w-[400px] h-[400px] bottom-0 left-1/3 bg-cyan-600/20" delay={4} />
      </div>

      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-slate-950/90 backdrop-blur-xl shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="/logo/logo final 1.png"
                alt="KlarText Logo"
                className="h-14 sm:h-16 md:h-20 w-auto object-contain"
              />
            </motion.div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/lessons" onClick={handleLessonsClick} className="text-gray-300 hover:text-white transition-colors">
              Lessons
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <SimpleThemeToggle />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoading && user ? (
                <Link href="/dashboard">
                  <LiquidButton variant="success" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Zap className="mr-2 h-4 w-4" />
                    Dashboard
                  </LiquidButton>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <LiquidButton variant="outline" className="border-white/20 hover:bg-white/10">
                      Log in
                    </LiquidButton>
                  </Link>
                  <Link href="/register">
                    <LiquidButton variant="success" className="bg-gradient-to-r from-emerald-600 to-teal-600">
                      <Zap className="mr-2 h-4 w-4" />
                      Get Started
                    </LiquidButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="p-4 space-y-4">
                <Link href="/lessons" onClick={handleLessonsClick} className="block text-gray-300 hover:text-white py-2">
                  Lessons
                </Link>
                <Link href="/pricing" className="block text-gray-300 hover:text-white py-2">
                  Pricing
                </Link>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {!isLoading && user ? (
                    <Link href="/dashboard" className="block">
                      <LiquidButton variant="success" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
                        Dashboard
                      </LiquidButton>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="block">
                        <LiquidButton variant="outline" className="w-full border-white/20">
                          Log in
                        </LiquidButton>
                      </Link>
                      <Link href="/register" className="block">
                        <LiquidButton variant="success" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">
                          Get Started Free
                        </LiquidButton>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20 sm:pt-24 pb-16">
        <motion.div 
          style={{ y: y1 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 backdrop-blur-xl"
              animate={{ boxShadow: ["0 0 20px rgba(168,85,247,0.2)", "0 0 40px rgba(168,85,247,0.4)", "0 0 20px rgba(168,85,247,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs sm:text-sm font-medium text-purple-300">
                #1 AI-Powered German Learning Platform
              </span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </motion.span>
          </motion.div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 sm:mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white block mb-2 sm:mb-4"
            >
              Master German Through
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent bg-[length:200%_auto] block animate-gradient"
              style={{
                animation: "gradient 3s ease infinite",
              }}
            >
              KlarText
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Learn German the natural way — 
            <span className="text-yellow-400 font-semibold"> read captivating stories</span>, 
            <span className="text-pink-400 font-semibold"> click any word</span> for instant translation, and 
            <span className="text-cyan-400 font-semibold"> master vocabulary effortlessly</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16"
          >
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <LiquidButton 
                  variant="primary"
                  size="lg" 
                  className="relative bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg rounded-2xl shadow-2xl border-0 w-full sm:w-auto"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </LiquidButton>
              </motion.div>
            </Link>
            
            <Link href="/lessons" onClick={handleLessonsClick}>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}>
                <LiquidButton 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-purple-500/50 text-white hover:bg-purple-500/20 px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg rounded-2xl backdrop-blur-xl bg-white/5 w-full sm:w-auto"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Explore Lessons
                </LiquidButton>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-gray-400 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <motion.div style={{ y: y2 }} className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={Users} number="10K+" label="Active Learners" delay={0} />
            <StatCard icon={BookOpen} number="500+" label="Stories Available" delay={0.1} />
            <StatCard icon={Award} number="95%" label="Success Rate" delay={0.2} />
            <StatCard icon={Globe} number="50+" label="Countries" delay={0.3} />
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              How <GradientText>KlarText</GradientText> Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A revolutionary approach to learning German through immersive storytelling
            </p>
          </motion.div>

          <div className="space-y-8 sm:space-y-12">
            <StepCard
              number="1"
              title="Choose Your Story"
              description="Browse our library of 500+ engaging stories tailored to your level, from beginner to advanced."
              icon={BookOpen}
              delay={0}
            />
            <StepCard
              number="2"
              title="Read & Learn"
              description="Click any word for instant translation, pronunciation, and context. Build vocabulary naturally as you read."
              icon={Languages}
              delay={0.1}
            />
            <StepCard
              number="3"
              title="Practice & Progress"
              description="Complete exercises, earn XP, and track your progress. Our AI adapts to your learning pace."
              icon={TrendingUp}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to <GradientText>Succeed</GradientText>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make your German learning journey effective and enjoyable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={Brain}
              title="AI-Adaptive Learning"
              desc="Our AI analyzes your progress and adjusts difficulty in real-time for optimal learning."
              gradient="from-purple-500 to-pink-500"
              delay={0}
            />
            <FeatureCard 
              icon={Languages}
              title="Instant Translation"
              desc="Click any word for context-aware translations. Build vocabulary effortlessly as you read."
              gradient="from-cyan-500 to-blue-500"
              delay={0.1}
            />
            <FeatureCard 
              icon={Headphones}
              title="Native Audio"
              desc="Listen to native speaker pronunciation for every word and sentence. Perfect your accent."
              gradient="from-green-500 to-emerald-500"
              delay={0.2}
            />
            <FeatureCard 
              icon={Trophy}
              title="Gamified Progress"
              desc="Earn XP, unlock achievements, and compete on leaderboards. Learning has never been this fun."
              gradient="from-yellow-500 to-orange-500"
              delay={0.3}
            />
            <FeatureCard 
              icon={MessageCircle}
              title="Voice Rooms"
              desc="Practice speaking with other learners in real-time voice chat rooms with AI assistance."
              gradient="from-pink-500 to-rose-500"
              delay={0.4}
            />
            <FeatureCard 
              icon={Target}
              title="Smart Vocabulary"
              desc="Automatically save and review words you struggle with. Spaced repetition for long-term retention."
              gradient="from-indigo-500 to-purple-500"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by <GradientText>Learners</GradientText> Worldwide
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join thousands of happy learners who have transformed their German skills
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <TestimonialCard
              quote="KlarText made learning German actually enjoyable. The stories are engaging and I love clicking words for instant translations!"
              name="Sarah M."
              role="Beginner learner, USA"
              avatar="SM"
              delay={0}
            />
            <TestimonialCard
              quote="I've tried many apps, but KlarText's approach of learning through stories is by far the most effective. My vocabulary has grown so much!"
              name="Thomas K."
              role="Intermediate learner, UK"
              avatar="TK"
              delay={0.1}
            />
            <TestimonialCard
              quote="The voice rooms feature is amazing! Practicing with other learners has really improved my speaking confidence."
              name="Maria L."
              role="Advanced learner, Brazil"
              avatar="ML"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-white/10 backdrop-blur-xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your German Journey?
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join over 10,000 learners who are mastering German through immersive storytelling. 
              Start for free today — no credit card required.
            </p>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="inline-block">
                <LiquidButton 
                  variant="primary"
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold px-10 sm:px-16 py-4 sm:py-6 text-base sm:text-lg rounded-2xl shadow-2xl border-0"
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </LiquidButton>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 text-center border-t border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo/logo final 1.png"
              alt="KlarText Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <p className="text-gray-400 mb-2">© 2024 KlarText. All rights reserved.</p>
          <p className="text-gray-500 text-sm">Made with ❤️ for German Learners Worldwide</p>
        </div>
      </footer>
    </div>
  );
}
