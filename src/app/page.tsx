"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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
  Award
} from "lucide-react";

// Dynamic imports for heavy components - reduces initial bundle size
const SplitText = dynamic(() => import("@/components/SplitText"), {
  ssr: false,
  loading: () => <span className="opacity-0">Loading...</span>,
});

const Particles = dynamic(() => import("@/components/Particles"), {
  ssr: false,
  loading: () => null,
});

const FloatingElement = ({ children, delay = 0, className = "" }: any) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-10, 10, -10] }}
    transition={{ 
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={className}
  >
    {children}
  </motion.div>
);

const GradientOrb = ({ className, delay = 0 }: any) => (
  <motion.div
    initial={{ scale: 0, rotate: 0 }}
    animate={{ 
      scale: [1, 1.2, 1],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
  />
);

const FeatureCard = ({ icon: Icon, title, desc, gradient }: any) => (
  <motion.div
    variants={{
      hidden: { y: 50, opacity: 0 },
      visible: { y: 0, opacity: 1 }
    }}
    whileHover={{ scale: 1.05, y: -10 }}
    className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden"
  >
    {/* Gradient background on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
    
    {/* Shine effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    
    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-2xl`}>
      <Icon className="h-8 w-8 text-white" />
    </div>
    <h3 className="relative text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
      {title}
    </h3>
    <p className="relative text-gray-300 leading-relaxed group-hover:text-white transition-colors">
      {desc}
    </p>
  </motion.div>
);

const StatCard = ({ icon: Icon, number, label }: any) => (
  <motion.div
    whileHover={{ scale: 1.1, y: -5 }}
    className="text-center group cursor-pointer"
  >
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30 group-hover:border-purple-400/50 transition-all">
      <Icon className="h-8 w-8 text-purple-400 group-hover:text-purple-300 transition-colors" />
    </div>
    <motion.div 
      className="text-3xl font-bold text-white mb-2"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
    >
      {number}
    </motion.div>
    <div className="text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
  </motion.div>
);

export default function LandingPage() {
  const { user } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = useState<Array<{left: number, top: number}>>([]);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };

    // Generate particle positions only on client side
    const positions = Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100
    }));
    setParticlePositions(positions);

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-foreground overflow-hidden relative">
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }}
      />
      
      {/* Enhanced Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-30" 
           style={{ 
             backgroundImage: 'linear-gradient(to right, rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Animated gradient mesh */}
      <div className="fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-tl from-pink-600/20 via-transparent to-cyan-600/20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* React Bits Particles Background */}
      <div className="absolute inset-0 opacity-30">
        <Particles
          particleCount={50}
          particleColors={['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B']}
          speed={0.5}
          particleSpread={800}
          particleBaseSize={2}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          className="w-full h-full"
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <GradientOrb className="w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 -top-48 -left-48" delay={0} />
        <GradientOrb className="w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 top-1/4 -right-40" delay={2} />
        <GradientOrb className="w-64 h-64 bg-gradient-to-r from-yellow-400 to-orange-400 bottom-1/4 left-1/4" delay={4} />
        <GradientOrb className="w-72 h-72 bg-gradient-to-r from-green-400 to-blue-400 -bottom-36 -right-36" delay={6} />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particlePositions.map((position, i) => (
          <FloatingElement key={i} delay={i * 0.2}>
            <div 
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              style={{
                left: `${position.left}%`,
                top: `${position.top}%`,
              }}
            />
          </FloatingElement>
        ))}
      </div>

      {/* Enhanced Navbar with Glassmorphism */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-50 w-full px-6 py-4 backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            style={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
          >
            <motion.div 
              className="w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-500 shadow-lg"
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                  "0 0 30px rgba(59, 130, 246, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.4)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img
                src="/logo/main logo.png"
                alt="KlarText Logo"
                className="w-full h-full object-contain p-1.5 mix-blend-lighten"
              />
            </motion.div>
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              KlarText
            </span>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <SimpleThemeToggle />
            {user ? (
              <>
                <Link href="/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LiquidButton variant="primary" className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-lg shadow-purple-500/30">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Dashboard
                    </LiquidButton>
                  </motion.div>
                </Link>
                <Link href="/lessons">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LiquidButton variant="outline" className="border-white/20 hover:bg-white/10 backdrop-blur-sm">
                      All Lessons
                    </LiquidButton>
                  </motion.div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LiquidButton 
                      variant="outline" 
                      className="border-white/20 hover:bg-white/10 backdrop-blur-sm"
                    >
                      Log in
                    </LiquidButton>
                  </motion.div>
                </Link>
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <LiquidButton variant="success" className="bg-gradient-to-r from-emerald-600 to-teal-600 border-0 shadow-lg shadow-emerald-500/30">
                      <Zap className="mr-2 h-4 w-4" />
                      Get Started
                    </LiquidButton>
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center pt-20 pb-32 max-w-7xl mx-auto">
        <motion.div
          style={{ y: y1, x: mousePosition.x }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <motion.span 
              className="group px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 text-transparent bg-clip-text text-sm font-bold tracking-wide uppercase border border-white/20 backdrop-blur-xl inline-flex items-center gap-2 shadow-lg shadow-purple-500/20"
              whileHover={{ scale: 1.05 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.2)",
                  "0 0 30px rgba(59, 130, 246, 0.3)",
                  "0 0 20px rgba(168, 85, 247, 0.2)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                The Future of Language Learning
              </span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </motion.span>
          </motion.div>

          <div className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-8">
            <SplitText
              text="Master German through"
              tag="h1"
              className="text-white mb-4"
              splitType="words"
              delay={50}
              duration={0.8}
              from={{ opacity: 0, y: 80, rotationX: -90 }}
              to={{ opacity: 1, y: 0, rotationX: 0 }}
            />
            <SplitText
              text="AI-Powered Storytelling"
              tag="h1"
              className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
              splitType="chars"
              delay={30}
              duration={1.2}
              from={{ opacity: 0, scale: 0, rotation: 180 }}
              to={{ opacity: 1, scale: 1, rotation: 0 }}
            />
          </div>

          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Revolutionary language learning powered by adaptive AI. 
            <span className="text-yellow-400 font-semibold"> Read immersive stories</span>, 
            <span className="text-pink-400 font-semibold"> click any word</span> for instant translation, and 
            <span className="text-cyan-400 font-semibold"> build vocabulary naturally</span>.
          </motion.p>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-20"
          >
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <LiquidButton 
                  variant="primary"
                  size="lg" 
                  className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-white font-bold px-10 py-6 text-lg rounded-2xl shadow-2xl border-0 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <span className="relative flex items-center">
                    <Zap className="mr-2 h-5 w-5" />
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </LiquidButton>
              </motion.div>
            </Link>
            
            <Link href="/lessons">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <LiquidButton 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-purple-500/50 text-white hover:bg-purple-500/20 px-10 py-6 text-lg rounded-2xl backdrop-blur-xl bg-white/5"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Explore Lessons
                </LiquidButton>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{ y: y2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24"
        >
          <StatCard icon={Users} number="10K+" label="Active Learners" />
          <StatCard icon={BookOpen} number="500+" label="Stories Available" />
          <StatCard icon={Award} number="95%" label="Success Rate" />
          <StatCard icon={Globe} number="12" label="Languages Soon" />
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 w-full"
        >
          <FeatureCard 
            icon={Brain}
            title="AI-Adaptive Learning"
            desc="Our AI analyzes your progress and adjusts difficulty in real-time, ensuring optimal learning pace."
            gradient="from-purple-500 to-pink-500"
          />
          <FeatureCard 
            icon={Languages}
            title="Instant Translation"
            desc="Click any word for immediate context-aware translations. Build vocabulary effortlessly as you read."
            gradient="from-cyan-500 to-blue-500"
          />
          <FeatureCard 
            icon={Trophy}
            title="Gamified Progress"
            desc="Earn XP, unlock achievements, and compete with friends. Learning German has never been this engaging."
            gradient="from-yellow-500 to-orange-500"
          />
        </motion.div>
      </main>

      {/* Enhanced Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 py-12 text-center text-gray-400 border-t border-white/10 backdrop-blur-xl bg-white/5"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
          <p className="text-lg font-medium bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            © 2024 KlarText. Revolutionizing Language Learning.
          </p>
          <Star className="w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <p className="text-sm text-gray-500">Built for German Learners Worldwide</p>
      </motion.footer>
    </div>
  );
}
