import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from 'react-phone-number-input';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment_success');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();

    // Handle payment success return
    if (paymentSuccess === 'true') {
      handlePaymentSuccess();
    }
  }, [navigate, paymentSuccess]);

  const handlePaymentSuccess = async () => {
    try {
      // Get stored user data
      const pendingUserData = localStorage.getItem('pendingUserData');
      if (!pendingUserData) {
        toast({
          title: "Error",
          description: "No pending registration data found",
          variant: "destructive",
        });
        return;
      }

      const userData = JSON.parse(pendingUserData);
      
      // Create payment approval record
      const { error: approvalError } = await supabase
        .from('payments_for_approval')
        .insert({
          user_id: userData.userId,
          payment_type: 'registration',
          amount: 5000,
          payment_confirmed: true, // Payment was successful
          reference_id: userData.userId
        });

      if (approvalError) throw approvalError;

      // Clear stored data
      localStorage.removeItem('pendingUserData');

      toast({
        title: "Payment confirmed!",
        description: "Your registration payment has been submitted for admin approval. You'll be notified once approved.",
      });

    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Check if phone number already exists
      const { data: existingPhone } = await supabase
        .from('profiles')
        .select('phone')
        .eq('phone', formData.phoneNumber)
        .single();

      if (existingPhone) {
        throw new Error('An account with this phone number already exists');
      }

      // Create the user account but don't confirm email yet
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phoneNumber,
          },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Please complete payment of ₦5,000 to proceed with registration.",
        });

        // Store user data temporarily for after payment
        localStorage.setItem('pendingUserData', JSON.stringify({
          userId: data.user.id,
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phoneNumber
        }));

        // Redirect to payment with return URL - Updated to ₦5,000 payment link
        const returnUrl = encodeURIComponent(`${window.location.origin}/signup?payment_success=true`);
        window.location.href = `https://paystack.shop/pay/registration-fee-5000?callback_url=${returnUrl}`;
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/e4fa81a3-01f8-4f2a-a00c-b542ef98cd8a.png" alt="CodeWave Logo" className="h-16" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/auth" className="font-medium text-green-600 hover:text-green-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Card className="bg-white/80 backdrop-blur-md shadow-xl border-green-100">
          <CardHeader>
            <CardTitle className="text-green-800">Join CodeWave</CardTitle>
            <CardDescription>
              Create your account and complete payment to start earning
            </CardDescription>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
              <p className="text-sm text-yellow-800 font-medium">
                ⚠️ Pay ₦5,000 registration fee - Admin approval required after payment
              </p>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <PhoneInput
                  value={formData.phoneNumber}
                  onChange={(value) => setFormData({ ...formData, phoneNumber: value || "" })}
                  placeholder="Enter phone number"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="border-green-200 focus:border-green-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account & Pay ₦5,000"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
