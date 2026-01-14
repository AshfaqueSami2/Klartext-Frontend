"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/ui/liquid-button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { 
  Search, Book, ArrowLeft, Layers, 
  Calendar, LayoutGrid, List,
  Clock, Flame, Trophy, BookOpen, ChevronRight, Zap
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

// --- Types ---
interface IVocabItem {
  _id: string;
  word: string;
  meaning: string;
  lesson?: {
    _id: string;
    title: string;
  };
  createdAt: string;
}

// --- Main Page Component ---
export default function MyVocabularyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vocabList, setVocabList] = useState<IVocabItem[]>([]);
  const [filteredList, setFilteredList] = useState<IVocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  useEffect(() => {
    const fetchVocab = async () => {
      try {
        const response = await api.get("/vocab/my-list");
        if (response.data.success) {
          setVocabList(response.data.data);
          setFilteredList(response.data.data);
        }
      } catch (error) {
        toast.error("Could not load your vocabulary.");
      } finally {
        setLoading(false);
      }
    };
    fetchVocab();
  }, []);

  // Dynamic stats based on actual data
  const stats = useMemo(() => {
    const today = new Date();
    const thisWeek = vocabList.filter(item => {
      const created = new Date(item.createdAt);
      const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const thisMonth = vocabList.filter(item => {
      const created = new Date(item.createdAt);
      return created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear();
    }).length;

    const lessonsWithWords = new Set(vocabList.filter(v => v.lesson).map(v => v.lesson?._id)).size;

    return { thisWeek, thisMonth, lessonsWithWords };
  }, [vocabList]);

  useEffect(() => {
    let results = vocabList.filter((item) =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort results
    if (sortBy === 'newest') {
      results = results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      results = results.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'alphabetical') {
      results = results.sort((a, b) => a.word.localeCompare(b.word));
    }
    
    setFilteredList(results);
  }, [searchTerm, vocabList, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <motion.div 
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="relative z-10"
            >
              <Book className="h-16 w-16 text-primary" />
            </motion.div>
          </div>
          <div className="text-center">
            <p className="font-serif text-foreground text-xl font-medium">Loading your vocabulary...</p>
            <p className="text-muted-foreground text-sm mt-1">Preparing your word collection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8 md:py-12">
        
        {/* --- Hero Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          {/* Back Button */}
          <LiquidButton 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="pl-0 text-muted-foreground hover:text-foreground hover:bg-transparent group text-sm mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Back to Dashboard
          </LiquidButton>

          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary/90 to-teal-600 p-6 md:p-10 shadow-2xl">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white/80 font-medium">Personal Vocabulary</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-2"
                >
                  Wortschatz
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg"
                >
                  {user?.name ? `${user.name}'s` : 'Your'} personal collection of{' '}
                  <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{vocabList.length}</span> German words
                </motion.p>
              </div>

              {/* Quick Stats Pills */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-3"
              >
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Flame className="h-4 w-4 text-yellow-300" />
                  <span className="text-white font-medium text-sm">{stats.thisWeek} this week</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Trophy className="h-4 w-4 text-yellow-300" />
                  <span className="text-white font-medium text-sm">{stats.lessonsWithWords} lessons</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* --- Stats Grid --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatsCard 
            icon={<Layers className="h-5 w-5" />} 
            label="Total Words" 
            value={vocabList.length.toString()} 
            gradient="from-blue-500 to-blue-600"
            delay={0}
          />
          <StatsCard 
            icon={<Zap className="h-5 w-5" />} 
            label="This Week" 
            value={stats.thisWeek.toString()} 
            gradient="from-amber-500 to-orange-500"
            delay={0.1}
          />
          <StatsCard 
            icon={<Calendar className="h-5 w-5" />} 
            label="This Month" 
            value={stats.thisMonth.toString()} 
            gradient="from-emerald-500 to-teal-500"
            delay={0.2}
          />
          <StatsCard 
            icon={<BookOpen className="h-5 w-5" />} 
            label="From Lessons" 
            value={stats.lessonsWithWords.toString()} 
            gradient="from-purple-500 to-pink-500"
            delay={0.3}
          />
        </motion.div>

        {/* --- Search & Filter Bar --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          {/* Search Input */}
          <div className="relative flex-1 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-teal-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative flex items-center bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search words or meanings..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60 rounded-2xl"
              />
              {searchTerm && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-lg"
                >
                  {filteredList.length} results
                </motion.span>
              )}
            </div>
          </div>

          {/* View & Sort Controls */}
          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 px-4 h-14 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A → Z</option>
            </select>
          </div>
        </motion.div>

        {/* --- Vocabulary Display --- */}
        {filteredList.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 md:py-24 bg-card/50 backdrop-blur-xl rounded-3xl border border-border/50 shadow-xl"
          >
            <div className="relative inline-block mb-6">
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
              <Book className="relative h-20 w-20 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-3">
              {searchTerm ? "No matches found" : "Your notebook awaits"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto text-base md:text-lg mb-6 px-4">
              {searchTerm 
                ? `We couldn't find any words matching "${searchTerm}"` 
                : "Start reading German stories to build your vocabulary collection!"}
            </p>
            {!searchTerm && (
              <LiquidButton onClick={() => router.push('/lessons')} className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Lessons
              </LiquidButton>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredList.map((item, index) => (
                <Flashcard 
                  key={item._id} 
                  item={item} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredList.map((item, index) => (
                <ListItem 
                  key={item._id} 
                  item={item} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Floating Stats Footer */}
        {vocabList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground">
              Keep learning! You've saved <span className="text-primary font-bold">{vocabList.length}</span> words so far. 🎉
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Beautiful 3D Flip Flashcard ---
function Flashcard({ item, index }: { item: IVocabItem, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.03, type: "spring", stiffness: 100 }}
      className="h-56 sm:h-64 w-full perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- FRONT SIDE (German) --- */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 flex flex-col items-center justify-center border border-border/50 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Decorative gradient corner */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-teal-500/10 to-transparent rounded-tr-full" />

          <motion.span 
            className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2 bg-primary/10 px-3 py-1 rounded-full"
          >
            Deutsch
          </motion.span>
          
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-4 text-center break-words select-none leading-tight">
            {item.word}
          </h2>
          
          <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
            <AudioPlayer
              text={item.word}
              variant="minimal"
              options={{ 
                language: 'de-DE', 
                speed: 0.8,
                voiceName: 'de-DE-ConradNeural'
              }}
            />
          </div>

          <motion.p 
            className="absolute bottom-4 text-xs text-muted-foreground/60 flex items-center gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span>Tap to reveal</span>
            <ChevronRight className="h-3 w-3" />
          </motion.p>
        </div>

        {/* --- BACK SIDE (English Meaning) --- */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary via-primary to-teal-600 rounded-2xl p-5 flex flex-col items-center justify-center shadow-lg"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)"
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-xl" />
          </div>

          <span className="relative z-10 text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase mb-2 bg-white/10 px-3 py-1 rounded-full">
            Meaning
          </span>
          
          <p className="relative z-10 text-xl sm:text-2xl font-medium text-white text-center leading-relaxed select-none">
            {item.meaning}
          </p>
          
          <div className="relative z-10 mt-auto w-full pt-4 border-t border-white/20 flex justify-between items-center">
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
            {item.lesson && (
              <Link 
                href={`/read/${item.lesson._id}`} 
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors bg-white/10 px-2 py-1 rounded-full"
              >
                <Book className="h-3 w-3" />
                <span>View Lesson</span>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Sub-Component: List Item View ---
function ListItem({ item, index }: { item: IVocabItem, index: number }) {
  const [showMeaning, setShowMeaning] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="group bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Word Number */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">{index + 1}</span>
        </div>

        {/* Word Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-foreground truncate">
              {item.word}
            </h3>
            <div onClick={(e) => e.stopPropagation()}>
              <AudioPlayer
                text={item.word}
                variant="minimal"
                options={{ language: 'de-DE', speed: 0.8, voiceName: 'de-DE-ConradNeural' }}
              />
            </div>
          </div>
          
          <AnimatePresence>
            {showMeaning && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-muted-foreground mt-1"
              >
                {item.meaning}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              showMeaning 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {showMeaning ? 'Hide' : 'Show'}
          </button>
          
          {item.lesson && (
            <Link 
              href={`/read/${item.lesson._id}`}
              className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Book className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Date footer - visible on hover */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: 'auto', 
          opacity: 1,
        }}
        className="px-5 py-2 bg-muted/50 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground"
      >
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Added {new Date(item.createdAt).toLocaleDateString()}
        </span>
        {item.lesson && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {item.lesson.title}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}

// --- Sub-Component: Stats Card with Animation ---
function StatsCard({ 
  icon, 
  label, 
  value, 
  gradient,
  delay = 0
}: { 
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.4 }}
      className="group relative overflow-hidden bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 p-5"
    >
      {/* Hover gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative z-10 flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-serif text-foreground">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}