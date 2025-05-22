
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { initiateRegistrationPayment, completeRegistrationAfterPayment, hasPendingRegistration } from "../utils/payments";

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
        
        if (result.success) {
          toast({
            title: "Registration successful!",
            description: "Your account has been created and you are now logged in.",
          });
          navigate('/dashboard');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Instead of making direct API call here, we'll store user data and initiate payment
      initiateRegistrationPayment({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      });
      
      toast({
        title: "Payment initiated",
        description: "Please complete the payment process to finish registration.",
      });
    } catch (error) {
      toast({
        title: "Registration process failed",
        description: error instanceof Error ? error.message : "There was a problem initiating the registration process.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackPayment = () => {
    // Use the updated function with user data
    initiateRegistrationPayment({
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2" size={16} />
            Back to Home
          </Link>
          <div className="flex justify-center mb-4">
            <img src="/lovable-uploads/e4fa81a3-01f8-4f2a-a00c-b542ef98cd8a.png" alt="CodeWave Logo" className="h-16" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{step === 1 ? "Step 1: Account Details" : "Step 2: Payment"}</CardTitle>
            <CardDescription>
              {step === 1
                ? "Fill in your personal information"
                : "Complete registration with payment"}
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
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full">
                  Continue to Payment
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    Registration fee: ₦5,000 
                    <br />
                    (₦2,500 will be credited to your account after registration)
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium">
                    We accept Paystack for secure and easy payments
                  </p>
                </div>
                
                <Button 
                  type="button" 
                  onClick={handlePaystackPayment} 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Pay with Paystack
                </Button>
                <p className="text-xs text-center text-gray-500">
                  Click the button above to proceed to secure payment with Paystack
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Back to Details
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Signup;
