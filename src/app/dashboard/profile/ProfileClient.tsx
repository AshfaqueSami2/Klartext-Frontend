"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { getLevelColor } from "@/lib/level-utils";
import PasswordChangeModal from "@/components/shared/PasswordChangeModal";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  BookOpen, 
  Target,
  Edit3,
  Save,
  Loader2,
  ArrowLeft,
  Camera,
  X,
  Crown,
  Sparkles,
  Flame,
  Award,
  TrendingUp,
  Zap,
  GraduationCap,
  CheckCircle,
  Shield
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  currentLevel: string;
  totalCoins: number;
  lessonsCompleted: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  bio?: string;
  wordsLearned?: number;
  authProvider?: 'local' | 'google';
}

interface DashboardStats {
  totalCoins: number;
  coins: number;
  completedLessons: number;
  savedWords: number;
  totalWords: number;
  streak: number;
  currentLevel: string;
}

const levelOrder = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      // Fetch profile and stats in parallel
      const [profileRes, statsRes] = await Promise.all([
        api.get("/user/me"),
        api.get("/analytics/dashboard")
      ]);
      
      console.log("[Profile] Stats response:", statsRes.data.data);
      
      setProfile(profileRes.data.data);
      setStats(statsRes.data.data);
      setName(profileRes.data.data.name);
      setBio(profileRes.data.data.bio || "");
    } catch (error) {
      console.error("[Profile] Error fetching data:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      if (bio.trim()) formData.append('bio', bio.trim());
      if (selectedImage) formData.append('profileImage', selectedImage);

      const response = await api.put("/user/update-profile", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setProfile(response.data.data);
      setEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      refreshUser?.();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentIndex = levelOrder.indexOf(profile.currentLevel);
    return ((currentIndex + 1) / levelOrder.length) * 100;
  };

  const getJoinedDuration = () => {
    if (!profile) return "";
    const joined = new Date(profile.createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile not found</h2>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6 sm:mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {!editing && (
            <Button 
              onClick={() => setEditing(true)}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </motion.div>

        {/* Profile Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5">
            {/* Cover Background */}
            <div className="h-32 sm:h-48 bg-gradient-to-r from-primary via-purple-500 to-pink-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              {subscription?.isPremium && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="text-white text-sm font-medium capitalize">{subscription.subscriptionPlan}</span>
                </div>
              )}
            </div>

            <CardContent className="relative px-4 sm:px-8 pb-6 sm:pb-8">
              {/* Profile Picture */}
              <div className="relative -mt-16 sm:-mt-20 mb-4 sm:mb-6">
                <div className="relative inline-block">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    {imagePreview || profile.profileImage ? (
                      <img 
                        src={imagePreview || profile.profileImage} 
                        alt={profile.name}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-background shadow-2xl"
                      />
                    ) : (
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-4xl sm:text-5xl border-4 border-background shadow-2xl">
                        {profile.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    
                    {/* Level Badge */}
                    <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${getLevelColor(profile.currentLevel)}`}>
                      {profile.currentLevel}
                    </div>
                  </motion.div>

                  {/* Edit Photo Button */}
                  {editing && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </motion.button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                {editing ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="mt-1.5 text-lg"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Bio</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself and your German learning journey..."
                          rows={3}
                          className="mt-1.5 resize-none"
                        />
                      </div>

                      {selectedImage && (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span className="text-sm">New photo selected</span>
                          <Button size="sm" variant="ghost" onClick={handleRemoveImage}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={updateLoading}
                          className="gap-2 bg-gradient-to-r from-primary to-purple-600"
                        >
                          {updateLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditing(false);
                            setName(profile.name);
                            setBio(profile.bio || "");
                            handleRemoveImage();
                          }}
                          disabled={updateLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{profile.name}</h1>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Joined {getJoinedDuration()} ago
                        </span>
                      </div>
                    </div>
                    
                    {profile.bio && (
                      <p className="text-muted-foreground max-w-2xl">{profile.bio}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize gap-1.5">
                        <GraduationCap className="w-3 h-3" />
                        {profile.role}
                      </Badge>
                      {/* Streak badge - Coming soon */}
                      {/* {profile.streak > 0 && (
                        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1.5">
                          <Flame className="w-3 h-3" />
                          {profile.streak} Day Streak
                        </Badge>
                      )} */}
                      {subscription?.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-600 border-yellow-500/20 gap-1.5">
                          <Crown className="w-3 h-3" />
                          Premium Member
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
        >
          <StatsCard
            icon={<Trophy className="w-6 h-6" />}
            label="Total Coins"
            value={stats?.coins || stats?.totalCoins || profile.totalCoins || 0}
            gradient="from-yellow-500 to-orange-500"
            suffix="🪙"
          />
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Lessons Done"
            value={stats?.completedLessons || profile.lessonsCompleted || 0}
            gradient="from-green-500 to-emerald-500"
          />
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            label="Day Streak"
            value={0}
            gradient="from-orange-500 to-red-500"
            suffix="🔥"
            comingSoon={true}
          />
          <StatsCard
            icon={<Target className="w-6 h-6" />}
            label="Words Saved"
            value={stats?.totalWords || stats?.savedWords || profile.wordsLearned || 0}
            gradient="from-purple-500 to-pink-500"
          />
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-primary/5">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Learning Progress
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">Your journey to German fluency</p>
                </div>
                <Badge className={`${getLevelColor(profile.currentLevel)} text-lg px-4 py-1`}>
                  {profile.currentLevel}
                </Badge>
              </div>

              {/* Level Progress Bar */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  {levelOrder.map((level, index) => (
                    <div 
                      key={level}
                      className={`flex flex-col items-center ${
                        levelOrder.indexOf(profile.currentLevel) >= index 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                        level === profile.currentLevel
                          ? 'bg-primary text-white scale-110 shadow-lg'
                          : levelOrder.indexOf(profile.currentLevel) > index
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {level}
                      </div>
                    </div>
                  ))}
                </div>
                <Progress value={getLevelProgress()} className="h-2" />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-8">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-auto py-4"
                  onClick={() => router.push("/dashboard")}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Dashboard</p>
                    <p className="text-xs text-muted-foreground">Continue learning</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-auto py-4"
                  onClick={() => router.push("/myVocabulary")}
                >
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <BookOpen className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">My Vocabulary</p>
                    <p className="text-xs text-muted-foreground">Review words</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-auto py-4"
                  onClick={() => router.push("/dashboard/leaderboard")}
                >
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Award className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Leaderboard</p>
                    <p className="text-xs text-muted-foreground">See rankings</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-auto py-4"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Shield className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">
                      {profile.authProvider === 'google' ? 'Set Password' : 'Change Password'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile.authProvider === 'google' ? 'Add login option' : 'Update security'}
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          isGoogleUser={profile.authProvider === 'google'}
        />
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ 
  icon, 
  label, 
  value, 
  gradient, 
  suffix = "",
  comingSoon = false
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  gradient: string;
  suffix?: string;
  comingSoon?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden relative">
        {comingSoon && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted/80">
              Coming Soon
            </Badge>
          </div>
        )}
        <CardContent className={`p-4 sm:p-6 ${comingSoon ? 'opacity-50' : ''}`}>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-3 shadow-lg`}>
            {icon}
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">
            {comingSoon ? '-' : value.toLocaleString()}{!comingSoon && suffix}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
