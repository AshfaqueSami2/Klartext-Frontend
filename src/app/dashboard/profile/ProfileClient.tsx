"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { PageNotFoundState } from "@/components/ui/page-states";
import { Textarea } from "@/components/ui/textarea";
import { getLevelColor } from "@/lib/level-utils";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  BookOpen, 
  Target,
  Edit,
  Save,
  Loader2,
  ArrowLeft,
  Camera,
  Upload,
  X
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
}

export default function ProfilePage() {
  useAuth(); // Hook for auth context (user data loaded separately)
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/me");
      setProfile(response.data.data);
      setName(response.data.data.name);
      setBio(response.data.data.bio || "");
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      if (bio.trim()) {
        formData.append('bio', bio.trim());
      }
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }

      const response = await api.put("/user/update-profile", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProfile(response.data.data);
      setEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!profile) {
    return <PageNotFoundState title="Profile not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and view your progress</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture & Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="relative group">
                    {profile.profileImage || imagePreview ? (
                      <img 
                        src={imagePreview || profile.profileImage} 
                        alt={profile.name}
                        className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                        {profile.name?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    {editing && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    {editing && (
                      <div className="space-y-2">
                        <Label>Profile Image</Label>
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            size="sm" 
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-3 w-3 mr-2" />
                            Choose Image
                          </Button>
                          {(selectedImage || imagePreview) && (
                            <Button 
                              type="button"
                              size="sm" 
                              variant="ghost"
                              onClick={handleRemoveImage}
                            >
                              <X className="h-3 w-3 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                    
                    {/* Name */}
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editing ? (
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="flex-1"
                        />
                      ) : (
                        <p className="font-medium text-gray-900">{profile.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <p>{profile.email}</p>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label>Bio</Label>
                      {editing ? (
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 text-sm">{profile.bio || "No bio yet"}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {editing ? (
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          onClick={handleUpdateProfile}
                          disabled={updateLoading}
                        >
                          {updateLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
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
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setEditing(true)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}

                    {/* Role & Level */}
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Role</Label>
                        <Badge variant="outline" className="capitalize">
                          {profile.role}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Current Level</Label>
                        <Badge className={`${getLevelColor(profile.currentLevel)} border`}>
                          {profile.currentLevel}
                        </Badge>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Learning Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5" />
                  Learning Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-600">Total Coins</span>
                  </div>
                  <span className="font-bold text-yellow-600">{profile.totalCoins || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-600">Lessons Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{profile.lessonsCompleted || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Target className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm text-gray-600">Current Streak</span>
                  </div>
                  <span className="font-bold text-orange-600">{profile.streak || 0} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  <BookOpen className="h-4 w-4" />
                  View Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/myVocabulary")}
                >
                  <Target className="h-4 w-4" />
                  My Vocabulary
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}