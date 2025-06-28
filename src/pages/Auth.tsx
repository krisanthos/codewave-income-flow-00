import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from 'react-phone-number-input';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
  });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const confirmed = searchParams.get('confirmed');
  const message = searchParams.get('message');

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();

    // Handle email confirmation
    if (confirmed === 'true') {
      toast({
        title: "Email confirmed!",
        description: "Your account has been activated. You can now log in.",
      });
    }

    // Handle registration complete message
    if (message === 'registration_complete') {
      toast({
        title: "Registration Complete!",
        description: "Your account has been created. Please check your email and then log in.",
      });
    }
  }, [navigate, confirmed, message]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Use the dedicated signup page",
      description: "Please use the main signup page for registration with payment.",
      variant: "destructive",
    });
    
    navigate('/signup');
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
          <h2 className="mt-2 text-center text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome to CodeWave
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account or{" "}
            <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-md shadow-xl border-green-100">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-green-800">Sign In</CardTitle>
              <CardDescription>Access your CodeWave account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
                    Create one here
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
