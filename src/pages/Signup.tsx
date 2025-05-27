
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { initiateRegistrationPayment, completeRegistrationAfterPayment, hasPendingRegistration, TEST_MODE } from "../utils/payments";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for payment success from URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const paymentSuccess = queryParams.get('payment_success');
    
    const checkPendingRegistration = async () => {
      if (paymentSuccess === 'true' || hasPendingRegistration()) {
        setIsLoading(true);
        
        const result = await completeRegistrationAfterPayment();
        
        if (result.success && result.userData) {
          // Register user with Supabase
          try {
            const { data, error } = await supabase.auth.signUp({
              email: result.userData.email,
              password: result.userData.password,
              options: {
                data: {
                  full_name: result.userData.fullName,
                  phone: result.userData.phoneNumber,
                }
              }
            });

            if (error) throw error;

            if (data.user) {
              // Create profile with registration fee payment
              const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  full_name: result.userData.fullName,
                  email: result.userData.email,
                  balance: 2000, // ₦2,000 welcome bonus after ₦5,000 payment
                  total_earned: 0,
                  registration_fee_paid: true,
                });

              if (profileError) throw profileError;

              // Create registration transaction
              const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                  user_id: data.user.id,
                  type: 'registration_bonus',
                  amount: 2000,
                  status: 'completed',
                  description: 'Welcome bonus after registration payment',
                  currency: 'NGN',
                });

              if (transactionError) throw transactionError;

              toast({
                title: "Registration successful!",
                description: "Welcome to CodeWave! ₦2,000 has been credited to your account.",
              });

              navigate('/dashboard');
            }
          } catch (error: any) {
            toast({
              title: "Registration failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Registration failed",
            description: "There was a problem creating your account.",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
      }
    };
    
    checkPendingRegistration();
  }, [location, navigate]);

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
    return true;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handlePaystackPayment = () => {
    initiateRegistrationPayment({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    });

    if (TEST_MODE) {
      toast({
        title: "Test Mode Active",
        description: "Registration processed in test mode - no actual payment required.",
      });
    } else {
      toast({
        title: "Payment initiated",
        description: "Please complete the payment process to finish registration.",
      });
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
            <CardTitle className="text-green-800">{step === 1 ? "Step 1: Account Details" : "Step 2: Payment"}</CardTitle>
            <CardDescription>
              {step === 1
                ? "Fill in your personal information"
                : "Complete registration with ₦5,000 payment"}
            </CardDescription>
          </CardHeader>
          {step === 1 ? (
            <form onSubmit={handleNextStep}>
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
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
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="border-green-200 focus:border-green-500"
                  />
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
                <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Continue to Payment
                </Button>
              </CardFooter>
            </form>
          ) : (
            <div>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    Registration fee: ₦5,000 
                    <br />
                    (₦2,000 will be credited to your account after registration)
                  </p>
                </div>
                
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md">
                  <p className="text-sm text-emerald-800 font-medium">
                    Secure payment via Paystack
                  </p>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handlePaystackPayment} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Pay ₦5,000 with Paystack"}
                </Button>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-green-200 text-green-600 hover:bg-green-50"
                  onClick={() => setStep(1)}
                >
                  Back to Details
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Signup;
