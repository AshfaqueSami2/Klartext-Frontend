"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
// Make sure this path points to your actual server action location
import { updateUserLevelAction } from "@/serverAction/onBoardingAction/onboarding.action"; 

interface LevelSelectionModalProps {
  currentLevel?: string;
  onComplete?: () => void; // ✅ New prop to notify parent when done
}

export default function LevelSelectionModal({ currentLevel: _currentLevel, onComplete }: LevelSelectionModalProps) {
  // If currentLevel is missing (undefined/null) or "A1" (default), we consider showing it based on parent logic.
  // Ideally, the parent controls rendering, so we can default isOpen to true if rendered.
  // _currentLevel is available for future use (e.g., pre-selecting in UI)
  const [isOpen, setIsOpen] = useState(true); 
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  const levels = [
    { id: "A1", title: "Beginner", desc: "I know a few words." },
    { id: "A2", title: "Elementary", desc: "I can use simple sentences." },
    { id: "B1", title: "Intermediate", desc: "I can talk about travel & work." },
    { id: "B2", title: "Upper Int.", desc: "I speak fluently naturally." },
  ];

  const handleConfirm = async () => {
    if (!selected) return;
    const token = localStorage.getItem("accessToken");
    
    if (!token) {
        toast.error("Authentication error. Please login again.");
        return;
    }
    
    setLoading(true);

    try {
      const result = await updateUserLevelAction(selected, token);
      
      if (result.success) {
        toast.success(`Welcome to ${selected}!`);
        setIsOpen(false);
        
        // ✅ Call the onComplete callback if it exists
        if (onComplete) {
            onComplete();
        }
      } else {
        toast.error(result.error || "Failed to save level. Try again.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-950/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#F0EAD6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-teal-100"
      >
        {/* Header */}
        <div className="bg-teal-900 p-8 text-center">
          <div className="mx-auto bg-teal-800 w-16 h-16 flex items-center justify-center rounded-full mb-4 shadow-lg">
            <GraduationCap className="h-8 w-8 text-[#F0EAD6]" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-white">Willkommen!</h2>
          <p className="text-teal-200 mt-2">To personalize your stories, tell us your German level.</p>
        </div>

        {/* Level Grid */}
        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {levels.map((lvl) => (
              <div
                key={lvl.id}
                onClick={() => setSelected(lvl.id)}
                className={`
                  cursor-pointer relative p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-4
                  ${selected === lvl.id 
                    ? "border-teal-600 bg-teal-50 shadow-md scale-[1.02]" 
                    : "border-teal-100 bg-white hover:border-teal-300 hover:bg-white/80"
                  }
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0
                  ${selected === lvl.id ? "bg-teal-600 text-white" : "bg-teal-100 text-teal-800"}
                `}>
                  {lvl.id}
                </div>
                <div>
                  <h4 className="font-bold text-teal-900">{lvl.title}</h4>
                  <p className="text-sm text-gray-500 leading-tight">{lvl.desc}</p>
                </div>
                {selected === lvl.id && (
                  <div className="absolute top-4 right-4 text-teal-600">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleConfirm}
              disabled={!selected || loading}
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Start Learning"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}