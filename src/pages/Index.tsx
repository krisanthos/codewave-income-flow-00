
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, DollarSign, Clock, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Earn Money Online
              <span className="block text-green-600">Tasks & Rewards</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Complete simple tasks, watch ads, and earn real money. Join thousands of users already earning daily rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 py-3">
                  Get Started <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Simple steps to start earning money online
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Sign Up</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Create your free account in minutes
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Complete Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Watch ads, follow social accounts, and more
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Earn Money</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Get paid instantly for completed tasks
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Withdraw</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  Cash out to your bank account anytime
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Demo Accounts Section */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Try Our Demo Accounts
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
            Test the platform with pre-loaded demo accounts
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-2">Demo Account 1</h3>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Email:</strong> demo1@codewave.com<br />
                <strong>Password:</strong> demo123password
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Login as Demo 1
                </Button>
              </Link>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-lg mb-2">Demo Account 2</h3>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Email:</strong> demo2@codewave.com<br />
                <strong>Password:</strong> demo123password
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Login as Demo 2
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 px-4">
            Join thousands of users earning money online today
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-3">
              Create Free Account <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
