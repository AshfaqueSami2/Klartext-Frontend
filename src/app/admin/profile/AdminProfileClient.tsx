"use client";

import { useState, useEffect } from "react";
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
  ArrowLeft
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProfilePage() {
  useAuth(); // Hook for auth context (user data loaded separately)
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/user/me");
      setProfile(response.data.data);
      setName(response.data.data.name);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await api.put("/user/me", { name: name.trim() });
      setProfile(response.data.data);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
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
    <div className="min-h-screen bg-background py-8">
      <BackgroundTexture />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
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
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-destructive" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
              <p className="text-gray-600 mt-1">Manage your administrator account</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administrator Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture & Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-2xl border-2 border-red-200">
                    {profile.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div className="flex-1 space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      {editing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="flex-1"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleUpdateProfile}
                            disabled={updateLoading}
                          >
                            {updateLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditing(false);
                              setName(profile.name);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{profile.name}</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditing(true)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
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
      </div>
    </div>
  );
}