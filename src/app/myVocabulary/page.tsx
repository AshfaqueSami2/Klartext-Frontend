"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { LiquidButton } from "@/components/ui/liquid-button";
import AudioPlayer from "@/components/ui/AudioPlayer";
import { Loader2, Search, Book, ArrowLeft, Sparkles, GraduationCap, Layers } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const [vocabList, setVocabList] = useState<IVocabItem[]>([]);
  const [filteredList, setFilteredList] = useState<IVocabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    const results = vocabList.filter((item) =>
      item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(results);
  }, [searchTerm, vocabList]);



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Loader2 className="h-10 w-10 text-primary" />
          </motion.div>
          <p className="font-serif text-foreground text-lg animate-pulse">Opening your vocabulary notebook...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Background Texture Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'radial-gradient(hsl(var(--primary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        
        {/* --- Header Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 space-y-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <LiquidButton 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="pl-0 text-primary hover:text-primary/80 hover:bg-transparent group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Back to Dashboard
              </LiquidButton>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mt-2 tracking-tight">
                Wortschatz
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Your personal collection of <span className="font-bold text-foreground border-b-2 border-primary/30">{vocabList.length}</span> learned words.
              </p>
            </div>

            {/* Floating Search Bar */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
              <div className="relative flex items-center bg-card backdrop-blur-sm rounded-full shadow-sm border">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search your words..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-none focus-visible:ring-0 text-lg placeholder:text-muted-foreground/60 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Stats / Quick Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard icon={<Layers />} label="Total Cards" value={vocabList.length.toString()} color="bg-primary/10 text-primary" />
            <StatsCard icon={<Sparkles />} label="Mastery" value="In Progress" color="bg-success/10 text-success" />
            <StatsCard icon={<GraduationCap />} label="Level" value="A1" color="bg-accent/10 text-accent-foreground" />
          </div>
        </motion.div>

        {/* --- Vocabulary Grid --- */}
        {filteredList.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-card/40 backdrop-blur-md rounded-3xl border-2 border-dashed border-border"
          >
            <Book className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-2xl font-serif text-foreground font-bold mb-2">No words found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm ? "We couldn't find a match for that search." : "Your notebook is empty. Go read some stories to fill these pages!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredList.map((item, index) => (
                <Flashcard 
                  key={item._id} 
                  item={item} 
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: 3D Flip Flashcard (STABILIZED) ---
function Flashcard({ item, index }: { item: IVocabItem, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="h-64 w-full perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full shadow-xl hover:shadow-2xl rounded-2xl"
        // Controlled 3D rotation with explicit prop
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        // Faster, snappier transition (0.3s)
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* --- FRONT SIDE (German) --- */}
        <div 
          className="absolute inset-0 w-full h-full bg-white rounded-2xl p-6 flex flex-col items-center justify-center border-2 border-teal-50"
          style={{ backfaceVisibility: "hidden" }} // Ensures front is hidden when flipped
        >
           {/* Decorative corner */}
           <div className="absolute top-0 right-0 p-4">
             <div className="w-12 h-12 bg-teal-50 rounded-bl-full -mr-4 -mt-4"></div>
           </div>

           <span className="text-xs font-bold tracking-widest text-primary uppercase mb-2">German</span>
           <h2 className="text-3xl font-serif font-bold text-foreground mb-4 text-center break-words select-none">
             {item.word}
           </h2>
           
           <div className="mt-2" onClick={(e) => e.stopPropagation()}>
             <AudioPlayer
               text={item.word}
               variant="minimal"
               options={{ 
                 language: 'de-DE', 
                 speed: 0.8,
                 voiceName: 'de-DE-ConradNeural' // Male German voice
               }}
             />
           </div>

           <p className="absolute bottom-4 text-xs text-muted-foreground font-medium">Click to flip</p>
        </div>

        {/* --- BACK SIDE (English) --- */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 flex flex-col items-center justify-center"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" // Pre-rotated so it shows correctly when parent flips
          }}
        >
          <span className="text-xs font-bold tracking-widest text-primary-foreground/50 uppercase mb-2">Meaning</span>
          <p className="text-xl font-medium text-primary-foreground text-center leading-relaxed select-none">
            {item.meaning}
          </p>
          
          <div className="mt-6 w-full pt-4 border-t border-primary-foreground/20 flex justify-between items-center px-2">
             <span className="text-xs text-primary-foreground/60 font-mono">
               {new Date(item.createdAt).toLocaleDateString()}
             </span>
             {item.lesson && (
               <Link href={`/read/${item.lesson._id}`} onClick={(e) => e.stopPropagation()}>
                 <Book className="h-4 w-4 text-primary-foreground/70 hover:text-primary-foreground transition-colors" />
               </Link>
             )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Sub-Component: Stats Pill ---
function StatsCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border border-border shadow-sm backdrop-blur-sm ${color.split(' ')[0]}`}>
      <div className={`p-3 rounded-full bg-card shadow-sm ${color.split(' ')[1]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-lg font-bold font-serif text-foreground">{value}</p>
      </div>
    </div>
  )
}