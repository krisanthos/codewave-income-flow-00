
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, Mail, Phone, Calendar, Wallet, Edit2, Save } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  balance: number;
  total_earned: number;
  registration_fee_paid: boolean;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    // ✌️ Redirect if not authenticated 💔
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  const fetchUserProfile = async () => {
    try {
      // ✌️ Fetch user profile data 🥀
      const { data, error } = await supabase.rpc('get_current_user_profile');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const profile = data[0];
        setUserProfile(profile);
        setFormData({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // ✌️ Update user profile information ❤️‍🩹
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated! 🎉",
        description: "Your profile has been successfully updated.",
      });

      setIsEditing(false);
      fetchUserProfile(); // ✌️ Refresh the profile data 🥀
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile... ✨</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found 😕</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ✌️ Header with back button 💔 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-green-800">My Profile 👤</h1>
        </div>

        <div className="space-y-6">
          {/* ✌️ Profile Overview Card 🥀 */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-green-100">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile.avatar_url} />
                  <AvatarFallback className="bg-green-100 text-green-600 text-2xl">
                    {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : '👤'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-green-800">
                {userProfile.full_name || 'Welcome!'}
              </CardTitle>
              <CardDescription>
                CodeWave Member since {new Date(userProfile.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* ✌️ Balance & Earnings Card ❤️‍🩹 */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Wallet className="mr-2 h-5 w-5" />
                💰 Account Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{userProfile.balance?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-green-600">Current Balance</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">
                    ₦{userProfile.total_earned?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-emerald-600">Total Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✌️ Profile Information Card 🥀 */}
          <Card className="bg-white/80 backdrop-blur-md shadow-xl border-green-100">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-green-800">
                  <User className="mr-2 h-5 w-5" />
                  📋 Profile Information
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="border-green-200 hover:bg-green-50"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ✌️ Email field (read-only) 💔 */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  value={userProfile.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* ✌️ Full Name field ❤️‍🩹 */}
              <div className="space-y-2">
                <Label htmlFor="full_name">👤 Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? "border-green-200 focus:border-green-500" : "bg-gray-50"}
                />
              </div>

              {/* ✌️ Phone field 🥀 */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? "border-green-200 focus:border-green-500" : "bg-gray-50"}
                />
              </div>

              {/* ✌️ Member since field 💔 */}
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Member Since
                </Label>
                <Input
                  value={new Date(userProfile.created_at).toLocaleDateString()}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              {/* ✌️ Action buttons when editing ❤️‍🩹 */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: userProfile.full_name || "",
                        phone: userProfile.phone || "",
                      });
                    }}
                    className="flex-1 border-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
