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
import { BackgroundTexture } from "@/components/ui/background-texture";
import { Textarea } from "@/components/ui/textarea";
import PasswordChangeModal from "@/components/shared/PasswordChangeModal";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  BookOpen, 
  Users,
  Edit,
  Save,
  Loader2,
  Settings,
  ArrowLeft,
  Camera,
  Upload,
  X,
  KeyRound
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  bio?: string;
  authProvider?: 'local' | 'google';
}

export default function AdminProfilePage() {
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
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
      console.error("Failed to fetch profile:", error);
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
    <div className="min-h-screen bg-background py-4 sm:py-6 md:py-8">
      <BackgroundTexture />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-14 sm:pt-4 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="gap-1.5 sm:gap-2 text-sm sm:text-base touch-target"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-600 mt-0.5 sm:mt-1 text-sm sm:text-base">Manage your administrator account</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administrator Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
                {/* Profile Picture & Basic Info */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="relative group shrink-0">
                    {profile.profileImage || imagePreview ? (
                      <img 
                        src={imagePreview || profile.profileImage} 
                        alt={profile.name}
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-red-200"
                      />
                    ) : (
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-xl sm:text-2xl border-2 border-red-200">
                        {profile.name?.[0]?.toUpperCase() || "A"}
                      </div>
                    )}
                    {editing && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 w-full space-y-3 sm:space-y-4">
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

                    {/* Role */}
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Administrator
                      </Badge>
                    </div>

                    {/* Join Date */}
                    <div className="space-y-2">
                      <Label>Administrator Since</Label>
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

          {/* Admin Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin")}
                >
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/lessons")}
                >
                  <BookOpen className="h-4 w-4" />
                  Manage Lessons
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/createlesson")}
                >
                  <BookOpen className="h-4 w-4" />
                  Create Lesson
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => router.push("/admin/users")}
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setShowPasswordModal(true)}
                >
                  <KeyRound className="h-4 w-4" />
                  {profile.authProvider === 'google' ? 'Set Password' : 'Change Password'}
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium text-red-600">Administrator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Access Level:</span>
                  <span className="font-medium">Full Access</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{new Date(profile.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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